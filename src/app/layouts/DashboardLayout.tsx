'use client';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-right" dir="rtl">
      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-10">
        {children}
      </main>
    </div>
  );
}
