import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { allowed } = useRoleGuard("admin");

  if (!allowed) {
    return (
      <div className="min-h-screen space-y-4 bg-muted/40 p-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
