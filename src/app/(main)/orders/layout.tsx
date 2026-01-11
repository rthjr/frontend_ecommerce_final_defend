import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        <ProfileSidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
