interface Company {
  [key: string]: string | number | boolean | undefined;
  id: number;
  companyName: string;
  contactPerson: string;
  designation: string;
  credits: number;
  revenue: number;
  status: string;
  avatar?: string;
  subscriptionType?: 'TRIAL' | 'SUBSCRIBER';
}

export default Company;
