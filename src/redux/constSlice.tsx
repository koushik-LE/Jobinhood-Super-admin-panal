import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { LoggedInUser } from '@/components/Models/header-user';

interface CompanyDetailsPayload {
  companyId: string;
  companyName: string;
  domain: string;
  gst?: string;
  address: {
    addressLine?: string;
    country: string;
    state?: string;
    city?: string;
    pinCode?: string;
  };
  contactPerson: string;
  designation: string;
  contactNumber: string;
  contactEmail: string;
  subscriptionType: string;
  transactionDetails: Array<{
    transactionId: string;
    transactionDate: string;
    amount: number;
  }>;
}

interface CompanyFormData {
  companyName?: string;
  contactPerson?: string;
  Designation?: string;
  address?: string;
  country?: string;
  contactNumber?: string;
  gstNo?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  companyDomain?: string;
  emailId?: string;
  subscriptionType?: 'TRIAL' | 'SUBSCRIBER';
  credits?: number;
}

// interface LoggedInUser {
//   [key: string]: unknown; // optional extra properties
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

interface ConstState {
  selectedEmail: string;
  otpsealedobject: string;
  companyDeatils: {
    companyName: string;
    companyId: string;
  };
  logoData: string | null;
  logedinUser: LoggedInUser | null;
  formData: CompanyFormData | null;
  isFormPersisted: boolean;
}

const initialState: ConstState = {
  selectedEmail: '',
  otpsealedobject: '',
  companyDeatils: {
    companyName: '',
    companyId: '',
  },
  logoData: null,
  logedinUser: null,
  formData: null,
  isFormPersisted: false,
};

const constSlice = createSlice({
  name: 'constant',
  initialState,
  reducers: {
    setSelectedEmail: (state, action: PayloadAction<string>) => {
      state.selectedEmail = action.payload;
    },
    setOtpSeledObject: (state, action: PayloadAction<string>) => {
      state.otpsealedobject = action.payload;
    },
    setCompanyDatils: (
      state,
      action: PayloadAction<{ companyName: string; companyId: string; subscriptionType: string }>
    ) => {
      state.companyDeatils = action.payload;
    },
    setLogoData: (state, action: PayloadAction<string | null>) => {
      state.logoData = action.payload;
    },
    setLogedinUser: (state, action: PayloadAction<LoggedInUser | null>) => {
      state.logedinUser = action.payload;
    },
    setCompanyFormData: (state, action: PayloadAction<CompanyFormData>) => {
      state.formData = action.payload;
      state.isFormPersisted = true;
    },
    clearCompanyFormData: state => {
      state.formData = null;
      state.isFormPersisted = false;
    },
  },
});

export const {
  setSelectedEmail,
  setOtpSeledObject,
  setCompanyDatils,
  setLogoData,
  setLogedinUser,
  setCompanyFormData,
  clearCompanyFormData,
} = constSlice.actions;

export default constSlice.reducer;
