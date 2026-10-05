'use client';
import DashboardLayout from '@/app/dashboard-layout';
import React from 'react';
import CompanyDetails from '@/components/companiesDetails/page';

export default function companyDetailsPage() {
  return (
    <DashboardLayout>
      <CompanyDetails />
    </DashboardLayout>
  );
}
