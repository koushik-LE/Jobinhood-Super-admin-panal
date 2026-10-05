import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface FormValues {
  companyName: string;
  contactPerson: string;
  Designation: string;
  contactNumber: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  gstNo: string;
  companyDomain: string;
  emailId: string;
  subscriptionType: string;
  credits: string;
}

type ExcelRow = Array<string | number | boolean | Date | null>;

const REQUIRED_HEADER_MAP: Record<string, string> = {
  'Company Name': 'companyName',
  'Contact Person': 'contactPerson',
  Designation: 'Designation',
  'Contact Number': 'contactNumber',
  Address: 'address',
  Country: 'country',
  State: 'state',
  City: 'city',
  'Pin Code': 'pinCode',
  'GST No': 'gstNo',
  GSTIN: 'gstNo',
  'Company Domain': 'companyDomain',
  'Email Id': 'emailId',
  Email: 'emailId',
  'Subscription Type': 'subscriptionType',
  Credits: 'credits',
};

const REQUIRED_KEYS: Array<keyof FormValues> = [
  'companyName',
  'contactPerson',
  'contactNumber',
  'country',
  'companyDomain',
  'emailId',
];

// Create a reverse map from internal keys to their preferred header label
const INTERNAL_KEY_TO_HEADER: Record<string, string> = {};
for (const [header, key] of Object.entries(REQUIRED_HEADER_MAP)) {
  // Only set if not already set, to prefer the first matching header
  if (!INTERNAL_KEY_TO_HEADER[key]) {
    INTERNAL_KEY_TO_HEADER[key] = header;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    });

    if (jsonData.length <= 1) {
      return NextResponse.json(
        { error: 'Uploaded file does not match the sample file format or is empty.' },
        { status: 400 }
      );
    }

    const headers = jsonData[0].map(h => String(h).trim());
    const row = jsonData[1];

    // Map headers to internal keys
    const mappedData: Partial<FormValues> = {};
    headers.forEach((header, i) => {
      const key = REQUIRED_HEADER_MAP[header];
      if (key) {
        mappedData[key as keyof FormValues] = String(row?.[i] ?? '');
      }
    });

    // Check if all *truly* required fields are present
    const missingFields = REQUIRED_KEYS.filter(key => !mappedData[key]);

    if (missingFields.length > 0) {
      // Map internal keys to their preferred header labels for the error message
      const missingLabels = missingFields.map(key => INTERNAL_KEY_TO_HEADER[key] || key);
      return NextResponse.json(
        {
          error: `Missing required fields in Excel file: ${missingLabels.join(', ')}`,
          receivedHeaders: headers,
        },
        { status: 400 }
      );
    }

    // Fill in all fields with values from mappedData or an empty string if not present
    const formValues: FormValues = {
      companyName: mappedData.companyName || '',
      contactPerson: mappedData.contactPerson || '',
      Designation: mappedData.Designation || '',
      contactNumber: mappedData.contactNumber || '',
      address: mappedData.address || '',
      country: mappedData.country || '',
      state: mappedData.state || '',
      city: mappedData.city || '',
      pinCode: mappedData.pinCode || '',
      gstNo: mappedData.gstNo || '',
      companyDomain: mappedData.companyDomain || '',
      emailId: mappedData.emailId || '',
      subscriptionType: mappedData.subscriptionType || '',
      credits: mappedData.credits || '',
    };

    return NextResponse.json({ data: formValues });
  } catch {
    return NextResponse.json({ error: 'Error processing Excel file' }, { status: 500 });
  }
}
