import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin — BONSAI VAULT",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="admin-layout">
      <AdminNav />
      <AdminGuard>
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </AdminGuard>
    </div>
  );
}
