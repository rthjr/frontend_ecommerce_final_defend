'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGetUserDetailsQuery, useUpdateUserMutation } from '@/lib/redux/api/usersApi';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  isAdmin: z.boolean().default(false),
});

export default function AdminUserEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { data: user, isLoading, error } = useGetUserDetailsQuery(id as string);
  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      isAdmin: false,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateUser({
        id: id as string,
        data: values,
      }).unwrap();
      toast.success('User updated successfully');
      router.push('/admin/users');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="py-10 text-center text-red-500">Error loading user</div>;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Edit User</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAdmin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Admin Access
                  </FormLabel>
                  <FormDescription>
                    Grant this user administrator privileges.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loadingUpdate}>
            {loadingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update User
          </Button>
        </form>
      </Form>
    </div>
  );
}
