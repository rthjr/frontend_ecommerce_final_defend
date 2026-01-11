import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <div className="pl-64">
        <main className="container py-8">{children}</main>
      </div>
    </div>
  );
}
