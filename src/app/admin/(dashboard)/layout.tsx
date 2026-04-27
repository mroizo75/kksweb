import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 pt-16 md:pt-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
