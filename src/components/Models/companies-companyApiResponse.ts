interface CompanyApiResponse {
  id: number;
  companyName: string;
  contactPerson?: string;
  contactEmail?: string;
  creditDistribute?: number;
  revenue?: number;
  status: string;
  subscriptionType?: string;
  users?: Array<{
    email?: string;
    phoneNumber?: string;
  }>;
  address?: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
  };
}

export default CompanyApiResponse;
