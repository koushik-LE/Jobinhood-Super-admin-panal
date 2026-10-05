export interface DataRow {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface DataRow {
  id: number | string;
  companyName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVE';
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  subcriberType: string;
}

export interface CreditTransaction extends DataRow {
  id: number;
  companyName: string;
  transactionDate: Date;
  amount: number;
  bankName: string;
  modeOfPayment: string;
  transactionId: string;
  addCredits: number;
}
