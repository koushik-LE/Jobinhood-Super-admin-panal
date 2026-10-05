interface CompanyData {
  data: {
    companyName: string;
    transactionDate?: string;
    amount?: number;
    transactionId?: string;
    modeOfPayment?: string;
    bankName?: string;
    addCredits?: number;
  };
}

export default CompanyData;
