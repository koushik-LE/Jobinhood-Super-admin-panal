'use client';

import DataTable from '@/components/constant/data-table';
import { motion } from 'framer-motion';
import AnimatedNumber from '@/components/animate-number';
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/custom-skeletons/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { IconTrendingUp } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

type SortConfig = {
  key: string;
  order: 'asc' | 'desc' | '';
};

interface CreditDataRow {
  id: number;
  sNo: number;
  name: string;
  noOfJD: number;
  resumeUploaded: number;
  shortlistedApplicant: number;
  interviewTaken: number;
  creditsDistributed: number;
}

interface ColumnDefinition<T> {
  key: keyof T;
  label: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

const CreditTableData = () => {
  // Dummy data for incidents (increased records for pagination testing)
  const allIncidentData = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1, // Add this line
    sNo: index + 1,
    name: `User ${index + 1}`,
    noOfJD: Math.floor(Math.random() * 5000) + 500,
    resumeUploaded: Math.floor(Math.random() * 1000) + 100,
    shortlistedApplicant: Math.floor(Math.random() * 500) + 50,
    interviewTaken: Math.floor(Math.random() * 50) + 5,
    creditsDistributed: Math.floor(Math.random() * 1000000) + 500000,
  }));

  const columnHeaders: Array<ColumnDefinition<CreditDataRow>> = [
    {
      key: 'sNo',
      label: 'S.No',
      render: row => row.sNo.toString(),
      width: '80px',
    },
    {
      key: 'name',
      label: 'Name Of User',
      render: row => row.name,
      sortable: true,
    },
    {
      key: 'noOfJD',
      label: 'No. of JD',
      render: row => row.noOfJD.toLocaleString(),
      align: 'right',
    },
    {
      key: 'resumeUploaded',
      label: 'Resume Uploaded',
      render: row => row.resumeUploaded.toLocaleString(),
      align: 'right',
    },
    {
      key: 'shortlistedApplicant',
      label: 'Shortlisted Applicant',
      render: row => row.shortlistedApplicant.toLocaleString(),
      align: 'right',
    },
    {
      key: 'interviewTaken',
      label: 'Interview Taken',
      render: row => row.interviewTaken.toLocaleString(),
      align: 'right',
    },
    {
      key: 'creditsDistributed',
      label: 'Credits Distributed',
      render: row => `$${row.creditsDistributed.toLocaleString()}`,
      align: 'right',
      sortable: true,
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalRecords = allIncidentData.length;

  // Sorting state with proper type
  const [sort, setSort] = useState<SortConfig>({ key: 'sNo', order: 'asc' });

  const router = useRouter();

  // Table loading state
  const [loadingTableData, setLoadingTableData] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoadingTableData(false);
    }, 2000);
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page change
  };

  // Updated: handleSortChange accepts full SortConfig
  const handleSortChange = (newSort: SortConfig) => {
    setSort(newSort);
  };

  // Paginate and sort the data
  const paginatedData = allIncidentData
    .slice() // copy to avoid mutating original
    .sort((a, b) => {
      const key = sort.key as keyof typeof a;

      if (a[key] < b[key]) return sort.order === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return sort.order === 'asc' ? 1 : -1;
      return 0;
    })
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'linear' }}
      className="mt-10"
    >
      {/* Card Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-blue60 dark:bg-gray10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          padding: '1rem',
          borderRadius: '12px',
          borderImage: 'linear-gradient(to right, #3acfd5 0%, #3a4ed5 100%) 1',
        }}
      >
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg shadow-lg transition-transform transform "
            style={{
              background:
                index === 0
                  ? 'linear-gradient(to right, #1E90FF, #125699)'
                  : index === 1
                    ? 'linear-gradient(to right, #32CD32, #196719)'
                    : index === 2
                      ? 'linear-gradient(to right, #FFA500, #996300)'
                      : 'linear-gradient(to right, #9370DB, #4F3C75)',
              borderRadius: '15px',
            }}
          >
            <motion.div
              className="bg-white p-4 m-0.5 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 dark:bg-[#0D1B2A] dark:border dark:border-indigo-600 border-2"
              whileHover={{ scale: 1.05 }}
              style={{
                borderRadius: '12px',
                border: '1px solid',
                borderImageSource: 'linear-gradient(92.7deg, #1E90FF 2.25%, #125699 107.75%)',
              }}
            >
              {loadingTableData ? (
                <>
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-1/2" />
                </>
              ) : (
                <>
                  <h3 className="text-lg text-blue120 dark:text-indigo-300">
                    {index === 0
                      ? 'Credits Distributed'
                      : index === 1
                        ? 'Available Credits'
                        : index === 2
                          ? 'Credits Used'
                          : 'Revenue'}
                  </h3>
                  <AnimatedNumber
                    textClass="text-4xl dark:text-white font-poppins font-semibold leading-[48px] text-center"
                    value={
                      index === 0 ? 1000000 : index === 1 ? 234567 : index === 2 ? 2345543 : 234532
                    }
                  />

                  {index >= 2 && (
                    <motion.div
                      className="absolute bottom-1 right-2 text-[#3C9059] flex items-center space-x-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <AnimatedNumber
                        textClass="text-xl dark:text-white font-poppins font-semibold leading-[48px] text-center"
                        value={5433}
                      />
                      <IconTrendingUp size={34} stroke={1.5} />
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* Table Section */}
      <motion.div
        className="transition-all duration-500 ease-in-out"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {loadingTableData ? (
          <div className="mt-4">
            <TableSkeleton rowCount={itemsPerPage} />
          </div>
        ) : (
          <div className="p-4 rounded-lg shadow-md bg-blue30 dark:bg-gray10">
            <DataTable
              data={paginatedData}
              selectedColumns={columnHeaders}
              total={totalRecords}
              current={currentPage}
              onChange={handlePageChange}
              setItemsPerPage={handleItemsPerPageChange}
              loading={false}
              isAction
              itemPerPage={itemsPerPage}
              setSort={handleSortChange}
              sort={sort}
              detailsUrl="/credits"
              defaultSortColumn={sort.key}
              type="credits"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreditTableData;
