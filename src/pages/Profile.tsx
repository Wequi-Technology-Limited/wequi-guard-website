import AdminShell from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { AuthUser } from "@/types/auth";
import { ADMIN_NAV } from "./AdminDashboard";

const ProfilePage = () => {
  const { user } = useAuthUser();

  return (
    <AdminShell navItems={ADMIN_NAV}>
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Your Profile</h2>
          <p className="text-sm text-muted-foreground">Review account details and session status.</p>
        </div>
        {!user ? <ProfileSkeleton /> : <ProfileDetails user={user} />}
      </section>
    </AdminShell>
  );
};

const formatProfileDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const ProfileDetails = ({ user }: { user: AuthUser }) => (
  <Card className="rounded-3xl border border-slate-200 shadow-lg">
    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <CardTitle className="text-2xl font-semibold capitalize">{user?.username}</CardTitle>
        <CardDescription>{user?.email}</CardDescription>
      </div>
      <Badge variant={user?.is_active ? "secondary" : "destructive"}>{user?.is_active ? "Active" : "Inactive"}</Badge>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="User ID" value={`#${user?.id ?? "—"}`} />
        <ProfileField label="Username" value={user?.username ?? "—"} />
        <ProfileField label="Email" value={user?.email ?? "—"} />
        <ProfileField label="Status" value={user?.is_active ? "Active" : "Inactive"} />
        <ProfileField label="Created" value={formatProfileDate(user?.created_at)} />
        <ProfileField label="Last updated" value={formatProfileDate(user?.updated_at)} />
      </div>
    </CardContent>
  </Card>
);

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

const ProfileSkeleton = () => (
  <Card className="rounded-3xl border border-slate-200 shadow-lg">
    <CardHeader className="space-y-3">
      <Skeleton className="h-6 w-40 rounded" />
      <Skeleton className="h-4 w-64 rounded" />
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProfilePage;
