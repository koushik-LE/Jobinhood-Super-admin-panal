export interface Companydetails {
  id: string;
  companyName: string;
  domain: string;
  gst: string;
  address: Address;
  contactPerson: string;
  contactEmail: string;
  designation: string;
  contactNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  subscriptionType: 'TRIAL' | 'PAID'; // Add other types if applicable
  transactionDetails: TransactionDetail[];
  creditDistribute: null;
  createdAt: string;
  revenue: number | null;
}

export interface Address {
  id: string;
  addressLine: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
}

export interface TransactionDetail {
  id: string;
  transactionDate: string;
  amount: number | null;
  transactionId: string | null;
  modeOfPayment: string;
  bankName: string | null;
  addCredits: number;
  companyId: string;
  companyName: string;
  deleted: boolean;
}
