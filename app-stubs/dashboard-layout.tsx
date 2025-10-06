import { redirect } from 'next/navigation';
import { createClient } from '@/lib/serverSupabase';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

// TODO: Implement auth check
async function checkAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} />
      <div className="flex-1">
        <DashboardHeader user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// TODO: Implement loading component
export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

// TODO: Implement error component
export function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
