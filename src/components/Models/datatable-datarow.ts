import type { DataRow } from './credit-transaction';

export interface CompanyDataRow extends DataRow {
  companyName: string;
  status: 'ACTIVE' | 'INACTIVE';
  contactPerson: string;
  designation: string;
  credits: number;
  revenue: string;
  subscriberType: string;
  avatar?: string;
}
