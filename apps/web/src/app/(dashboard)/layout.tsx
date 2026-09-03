import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      {/* Sidebar - fixed */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="pl-60 flex flex-col min-h-screen">
        <TopBar />
        
        {/* Main Content Pane */}
        <main className="flex-1 p-8 bg-[#000000]">
          {children}
        </main>
      </div>
    </div>
  );
}
