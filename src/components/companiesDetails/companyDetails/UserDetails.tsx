'use client';
import DataTable from '@/components/constant/data-table';
import type { DataRow } from '@/components/constant/data-table';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { showToast } from '@/components/constant/custom-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserDetailsProps {
  id: string; // or `number` if `id` is numeric
  setUserCount: (count: number) => void;
}

interface SortConfig {
  key: string;
  order: 'asc' | 'desc' | ''; // Explicitly type as either "asc" or "desc"
}
type SortState = { key: string; order: 'asc' | 'desc' | '' };

interface CompanyData extends DataRow {
  [key: string]: unknown; // Add index signature to satisfy DataRow
  id: string;
  email: string;
  active: boolean;
  numberOfJd: number;
  resumeUpdated: number;
  shortListedApplicant: number;
  interviewTaken: number;
  interviewPending: number;
  role: string;
  fileStorage: {
    fileStorageId: string;
    fileName: string;
    fileType: string;
    data: string;
  } | null;
  creditConsumed: number;
  name: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ id, setUserCount }) => {
  const [loadingTableData, setLoadingTableData] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', order: 'desc' });

  const columnHeaders = [
    {
      key: 'name',
      label: 'Name',
      render: (item: CompanyData) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8 rounded-full border dark:border-gray-600 border-gray-300 shadow-md transition-all duration-300">
            {item.fileStorage?.data ? (
              <AvatarImage
                src={`data:${item.fileStorage.fileType};base64,${item.fileStorage.data}`}
                alt={item.name}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <AvatarFallback className="w-full h-full flex items-center justify-center text-lg font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 transition-all duration-300">
                {item.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'numberOfJd',
      label: 'No. of JD',
      render: (item: CompanyData) => <span>{item.numberOfJd}</span>,
    },
    {
      key: 'resumeUpdated',
      label: 'Resume Uploaded',
      render: (item: CompanyData) => <span>{item.resumeUpdated}</span>,
    },
    {
      key: 'shortListedApplicant',
      label: 'Shortlisted Applicant',
      render: (item: CompanyData) => <span>{item.shortListedApplicant}</span>,
    },
    {
      key: 'interviewTaken',
      label: 'Interview Taken',
      render: (item: CompanyData) => <span>{item.interviewTaken}</span>,
    },
  ];
  const searchParams = useSearchParams();
  const DEFAULT_SORT: SortState = { key: 'name', order: 'desc' };
  const getRelevantSort = (): SortState => {
    const sortKey: string | null = searchParams.get('sortkey');
    const sortOrder: string | null = searchParams.get('sortorder');

    if (sortKey && (sortOrder === 'asc' || sortOrder === 'desc')) {
      return {
        key: sortKey,
        order: sortOrder,
      };
    }

    return DEFAULT_SORT;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoadingTableData(true);
      try {
        const requestBody = {
          id,
          page: currentPage - 1,
          size: itemsPerPage,
          sortBy: sort.key,
          sortDir: sort.order,
        };

        const response = await axios.post(`/api/company/details/userList`, requestBody);

        if (response.status === 200) {
          const data = response.data;
          const content = data.data?.content || [];
          setUserCount(data.data?.numberOfElements || 0);
          // Ensure each item has an id
          const processedData = content.map((item: CompanyData) => ({
            ...item,
            id: item.id || item.email, // Use email as fallback id if id is not present
          }));
          setCompanyData(processedData);
          // Set total records and pages from the API response
          setTotalRecords(data.data?.totalElements || 0);
          setTotalPages(data.data?.totalPages || 0);
        } else {
          showToast('error', 'Failed to fetch company details');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('error', 'Failed to fetch the data');
      } finally {
        setLoadingTableData(false);
      }
    };

    fetchData();
  }, [id, currentPage, itemsPerPage, sort, setUserCount]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="h-full overflow-hidden">
      {loadingTableData ? (
        <div className="mt-1 p-4 bg-white dark:bg-gray10 rounded-lg shadow">
          {/* Table Skeleton Header */}
          <div className="flex justify-between border-b pb-2 mb-2">
            {columnHeaders.map((header, index) => (
              <Skeleton key={index} className="h-6 w-20 rounded" />
            ))}
          </div>

          {/* Table Skeleton Rows */}
          {[...Array(itemsPerPage)].map((_, index) => (
            <div key={index} className="flex justify-between py-2">
              {columnHeaders.map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-[#1A1A2E] overflow-auto">
          <DataTable
            data={companyData}
            selectedColumns={columnHeaders}
            total={totalRecords}
            current={currentPage}
            onChange={handlePageChange}
            setItemsPerPage={handleItemsPerPageChange}
            loading={loadingTableData}
            isAction={false}
            itemPerPage={itemsPerPage}
            setSort={setSort}
            sort={sort}
            detailsUrl="/credits"
            defaultSortColumn="name"
            type="credits"
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default UserDetails;
