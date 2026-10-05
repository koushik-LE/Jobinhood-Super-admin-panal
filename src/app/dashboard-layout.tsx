'use client';
import Header from '@/components/Header/page';
import CustomBreadcrumb from '@/components/constant/bread-crumbs';
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
}: DashboardLayoutProps) => (
  <div className="overflow-none border">
    {/* <ProtectedRoute> */}
    {/* <UserProvider value={{ username, name, id }}> */}
    {/* <div className={`flex flex-col h-screen`}> */}
    <Header />
    <div
      className="flex flex-1 mt-[112px] overflow-y-hidden"
      style={{
        height: 'calc(100vh - 64px)', // Fill the remaining viewport height
      }}
    >
      {/* <div className="hidden bg-gray-200 min-h-full fixed top-0 left-0 bottom-0 mt-[72px] sm:block z-30 overflow-auto scrollbar-custom" > */}
      {/* <Sidebar
                    sidebarWidth={sidebarWidth}
                    setSidebarWidth={setSidebarWidth}
                    isCollapsed={isCollapse}
                // setIsCollapsed={setIsCollapsed}
                /> */}
      {/* </div> */}
      <main
        className=" flex-1 overflow-auto pt-2 pb-3 px-1"
        style={{
          maxHeight: 'calc(100vh - 64px)', // Ensure scrollable area
        }}
      >
        <div
          className="pl-1 pr-2 mt-4 z-0"
          style={{
            padding: '0rem 1.5rem 1.5rem 1.5rem',
          }}
        >
          {children}
        </div>
      </main>
    </div>
    {/* </div> */}
    {/* </UserProvider> */}
    {/* </ProtectedRoute> */}
  </div>
);
export default DashboardLayout;
