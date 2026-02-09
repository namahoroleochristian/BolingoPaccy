export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          album_id: string
          amount: number
          callback_url: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_first_name: string | null
          customer_last_name: string | null
          id: string
          merchant_reference: string
          notification_id: string | null
          pesapal_tracking_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          album_id: string
          amount: number
          callback_url?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          id?: string
          merchant_reference: string
          notification_id?: string | null
          pesapal_tracking_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          album_id?: string
          amount?: number
          callback_url?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          id?: string
          merchant_reference?: string
          notification_id?: string | null
          pesapal_tracking_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          confirmed_at: string
          currency: string | null
          id: string
          order_id: string
          payment_method: string | null
          payment_status: string
          pesapal_transaction_id: string | null
          raw_response: Json | null
        }
        Insert: {
          amount?: number | null
          confirmed_at?: string
          currency?: string | null
          id?: string
          order_id: string
          payment_method?: string | null
          payment_status: string
          pesapal_transaction_id?: string | null
          raw_response?: Json | null
        }
        Update: {
          amount?: number | null
          confirmed_at?: string
          currency?: string | null
          id?: string
          order_id?: string
          payment_method?: string | null
          payment_status?: string
          pesapal_transaction_id?: string | null
          raw_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pesapal_config: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          album_id: string
          audio_url: string | null
          created_at: string
          duration: string | null
          id: string
          is_preview: boolean
          title: string
          track_number: number
        }
        Insert: {
          album_id: string
          audio_url?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_preview?: boolean
          title: string
          track_number: number
        }
        Update: {
          album_id?: string
          audio_url?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_preview?: boolean
          title?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "songs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      // ADDED: premium_access_logs table
      premium_access_logs: {
        Row: {
          id: string
          user_email: string
          album_id: string
          accessed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_email: string
          album_id: string
          accessed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          album_id?: string
          accessed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_access_logs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_purchased_album: {
        Args: { _album_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status: "pending" | "completed" | "failed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: ["pending", "completed", "failed", "cancelled"],
    },
  },
} as const