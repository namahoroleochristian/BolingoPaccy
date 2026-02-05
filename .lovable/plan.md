

# Implementation Plan: E-Commerce & Admin System for BOLINGO Paccy

This plan transforms your artist website into a full-featured digital music store with user authentication, a shopping cart, gated album content, and an admin dashboard.

---

## Overview

```text
+------------------+     +------------------+     +------------------+
|   Authentication |---->|   Shopping Cart  |---->|   Mock Payment   |
|   (Supabase)     |     |   + Checkout     |     |   Flow           |
+------------------+     +------------------+     +------------------+
         |                                                |
         v                                                v
+------------------+                          +------------------+
|   User Profile   |                          |   Purchases DB   |
|   + Library      |                          |   (user_id +     |
+------------------+                          |   album_id)      |
         |                                    +------------------+
         v                                                |
+------------------+                                      v
|   Album Player   |<------------------------------------|
|   (Gated Access) |
+------------------+

+------------------+
|  Admin Dashboard |
|  (Role-based)    |
+------------------+
```

---

## Phase 1: Enable Lovable Cloud & Set Up Database

**What happens:** Enable Lovable Cloud to get database, authentication, and edge function capabilities. Create the necessary database tables.

**Database Schema:**

| Table | Columns | Purpose |
|-------|---------|---------|
| `profiles` | id, user_id, display_name, avatar_url, created_at | User profile data |
| `user_roles` | id, user_id, role (enum: admin, user) | Role-based access control |
| `albums` | id, title, description, price, cover_url, is_active | Album inventory |
| `tracks` | id, album_id, title, duration, audio_url, track_number | Album tracks |
| `purchases` | id, user_id, album_id, purchased_at, transaction_id | Purchase records |
| `site_content` | id, key, value, updated_at | Editable site content |
| `tour_dates` | id, date, venue, city, status, ticket_url | Tour information |

**Security:** Row Level Security (RLS) policies will protect all tables. Admin role checks use a `has_role()` security definer function to prevent privilege escalation.

---

## Phase 2: User Authentication

**Features:**
- Sign up / Login page at `/auth`
- Email + password authentication
- Automatic redirect for logged-in users
- Session persistence using `onAuthStateChange`
- Auth context provider for app-wide access
- Error handling with user-friendly messages

**New Files:**
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/pages/Auth.tsx` - Login/signup page
- `src/components/ProtectedRoute.tsx` - Route guard component

---

## Phase 3: Shopping Cart System

**Features:**
- Cart icon in navigation with item count badge
- Add to cart functionality on Shop and Home pages
- Cart drawer/modal showing items
- Persist cart in localStorage for guests
- Quantity management and remove items

**New Files:**
- `src/contexts/CartContext.tsx` - Cart state management
- `src/components/CartDrawer.tsx` - Cart sidebar/modal
- `src/components/CartIcon.tsx` - Navigation cart button

---

## Phase 4: Mock Payment Flow

**Features:**
- Checkout page with order summary
- Mock payment form (card number validation UI)
- "Pay Now" simulates successful transaction
- On success: Create purchase record in database
- Confirmation page with access to album

**New Files:**
- `src/pages/Checkout.tsx` - Payment flow page
- `src/pages/OrderConfirmation.tsx` - Success page

---

## Phase 5: User Profile & Purchased Library

**Features:**
- Profile page at `/profile` (protected route)
- Display user info and avatar
- "My Library" section showing purchased albums
- Quick access to play purchased content
- Edit profile functionality

**New Files:**
- `src/pages/Profile.tsx` - User profile page
- `src/components/PurchasedLibrary.tsx` - Library display

---

## Phase 6: Gated Album Player

**Features:**
- Album player page at `/player/:albumId`
- Access check: Query purchases table for user + album
- Non-purchasers see preview with "Buy Now" prompt
- Purchasers get full audio player with:
  - Track list navigation
  - Play/pause controls
  - Progress bar
  - Volume control
- Placeholder audio functionality (uses demo tracks)

**New Files:**
- `src/pages/AlbumPlayer.tsx` - Full player page
- `src/components/AudioPlayer.tsx` - Player component
- `src/hooks/usePurchaseCheck.ts` - Purchase verification hook

---

## Phase 7: Admin Dashboard

**Features:**
- Protected route at `/admin` (admin role required)
- Dashboard sections:

| Section | Functionality |
|---------|---------------|
| **Overview** | Total sales, revenue, recent transactions |
| **Content** | Edit bio text, hero images |
| **Inventory** | Update album price, description |
| **Tour Dates** | Add/edit/remove tour dates |
| **Transactions** | List of all purchases |

**New Files:**
- `src/pages/admin/Dashboard.tsx` - Main admin page
- `src/pages/admin/ContentEditor.tsx` - Site content management
- `src/pages/admin/InventoryManager.tsx` - Album management
- `src/pages/admin/TourManager.tsx` - Tour dates management
- `src/pages/admin/TransactionList.tsx` - Sales viewer
- `src/components/AdminSidebar.tsx` - Admin navigation
- `src/hooks/useAdminCheck.ts` - Admin role verification

---

## Phase 8: UI/UX Enhancements

**Changes:**
- Add cart icon to Navigation component (with badge)
- User avatar/login button in navigation
- Dark mode refinements for pro aesthetic
- Loading states and skeleton components
- Toast notifications for actions (add to cart, purchase, etc.)

---

## Updated Navigation Structure

```text
+------------------------------------------+
|  BP  |  BOLINGO Paccy  |  Songs  Shop  Album  Tour  |  [Cart]  [User]  |
+------------------------------------------+
```

- **Cart Icon**: Shows item count, opens cart drawer
- **User Icon**: Shows avatar when logged in, links to profile; shows "Login" when logged out

---

## File Summary

**New Pages (10 files):**
- `Auth.tsx`, `Profile.tsx`, `Checkout.tsx`, `OrderConfirmation.tsx`, `AlbumPlayer.tsx`
- `admin/Dashboard.tsx`, `admin/ContentEditor.tsx`, `admin/InventoryManager.tsx`, `admin/TourManager.tsx`, `admin/TransactionList.tsx`

**New Components (8 files):**
- `AuthContext.tsx`, `CartContext.tsx`, `ProtectedRoute.tsx`, `CartDrawer.tsx`, `CartIcon.tsx`, `AudioPlayer.tsx`, `PurchasedLibrary.tsx`, `AdminSidebar.tsx`

**New Hooks (3 files):**
- `useAuth.ts`, `usePurchaseCheck.ts`, `useAdminCheck.ts`

**Modified Files:**
- `Navigation.tsx` - Add cart and user icons
- `Shop.tsx` - Add to cart functionality
- `Home.tsx` - Buy Now links to cart/checkout
- `Album.tsx` - Add to cart + play if owned
- `App.tsx` - New routes

---

## Technical Details

### Database Security (RLS Policies)

```text
profiles:       Users can read/update own profile
user_roles:     Read via has_role() function only
albums:         Public read, admin write
tracks:         Public read for owned albums, admin write  
purchases:      Users read own, insert on checkout
site_content:   Public read, admin write
tour_dates:     Public read, admin write
```

### Admin Role Function

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

### Authentication Flow

1. User signs up/logs in at `/auth`
2. `onAuthStateChange` updates global auth state
3. Profile created automatically on signup
4. Protected routes check auth state
5. Admin routes additionally check role

### Purchase Verification

1. User navigates to `/player/:albumId`
2. Hook queries: `SELECT * FROM purchases WHERE user_id = ? AND album_id = ?`
3. If no record: Show preview + buy prompt
4. If purchased: Initialize audio player

---

## Implementation Order

1. Enable Lovable Cloud
2. Create database tables and RLS policies
3. Authentication (can test signup/login)
4. Cart system (can test adding items)
5. User profile (can view profile)
6. Checkout + purchases (can complete mock purchase)
7. Gated player (can access after purchase)
8. Admin dashboard (can manage content)

