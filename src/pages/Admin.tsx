import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  title: string;
  type: 'song' | 'video';
  price: number;
  storage_path: string;
}

const columnHelper = createColumnHelper<MediaItem>();

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // In a real app, you would check a custom claim or a separate 'admins' table.
      // For this demo, we'll check user metadata.
      const hasAdminAccess = user?.app_metadata?.is_admin || user?.user_metadata?.is_admin;

      if (!user || !hasAdminAccess) {
        setIsAdmin(false);
        toast.error('Access Denied: Admins Only');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [navigate]);
  const [newMedia, setNewMedia] = useState({
    title: '',
    type: 'song' as 'song' | 'video',
    price: 0,
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as MediaItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('media').insert([
        {
          ...newMedia,
          storage_path: filePath,
        },
      ]);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media uploaded successfully');
      setFile(null);
      setNewMedia({ title: '', type: 'song', price: 0 });
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media deleted');
    },
  });

  const columns = [
    columnHelper.accessor('title', { header: 'Title' }),
    columnHelper.accessor('type', { header: 'Type' }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => `$${info.getValue()}`
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <Button
          variant="destructive"
          size="icon"
          onClick={() => deleteMutation.mutate(props.row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: media || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-black text-white">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p>You do not have permission to view this page. Redirecting to home...</p>
      </div>
    );
  }

  if (isAdmin === null) {
    return <div className="p-8 text-center">Verifying credentials...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <Card className="p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Upload New Media</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newMedia.title}
                onChange={e => setNewMedia({ ...newMedia, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="w-full border border-input bg-background px-3 py-2 rounded-md"
                value={newMedia.type}
                onChange={e => setNewMedia({ ...newMedia, type: e.target.value as 'song' | 'video' })}
              >
                <option value="song">Song</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={newMedia.price}
                onChange={e => setNewMedia({ ...newMedia, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="file">File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                <input
                  type="file"
                  id="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : 'Click or drag & drop to upload'}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={isUploading || !file || !newMedia.title}
              onClick={() => uploadMutation.mutate()}
            >
              {isUploading ? 'Uploading...' : 'Upload Media'}
            </Button>
          </div>
        </Card>

        {/* Media Table */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Media</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Admin;
