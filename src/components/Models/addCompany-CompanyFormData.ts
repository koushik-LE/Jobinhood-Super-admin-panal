interface CompanyFormData {
  companyName: string;
  contactPerson: string;
  Designation?: string;
  address?: string;
  country: string;
  contactNumber: string;
  gstNo?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  companyDomain: string;
  emailId: string;
  subscriptionType: 'TRIAL' | 'SUBSCRIBER';
  credits?: number;
}

export default CompanyFormData;
