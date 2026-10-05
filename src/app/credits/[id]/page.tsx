'use client';
import React from 'react';
//import CreditsCompanyData from "@/components/creditsComponents/creditsCompanyData";
import DashboardLayout from '@/app/dashboard-layout';
//import CreditTableData from "@/components/creditsComponents/creditsTableData";
import AddCreditsPage from '@/components/creditsComponents/addCreditsPage';
export default function page() {
  return (
    <div>
      <DashboardLayout>
        <AddCreditsPage />
        {/* <CreditsCompanyData />
        <CreditTableData /> */}
      </DashboardLayout>
    </div>
  );
}
