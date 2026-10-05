import DashboardLayout from '@/app/dashboard-layout';
import AddCreditsPage from '@/components/creditsComponents/addCreditsPage';
import React from 'react';

export default function page() {
  return (
    <DashboardLayout>
      <AddCreditsPage />
    </DashboardLayout>
  );
}
