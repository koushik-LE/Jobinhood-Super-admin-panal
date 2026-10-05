import { apiHelper } from '@/lib/apiHelper';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const fileBuffer = await apiHelper('api/company/downloadExcel', {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      responseType: 'arraybuffer', // VERY important!
    });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=sample-file.xlsx',
      },
    });
  } catch (error) {
    console.error('Download Excel error:', error);
    return new NextResponse('Failed to download Excel', { status: 500 });
  }
}
