interface RequestBody {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc' | '';
  companyName?: string;
  status?: string;
  subscriptionType?: string;
  id?: string | string[];
}

export default RequestBody;
