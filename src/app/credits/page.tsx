'use client';
import DataTable from '@/components/constant/data-table';
import type { MenuItem } from '@/components/constant/data-table';
import DashboardLayout from '../dashboard-layout';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/custom-skeletons/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { IconPlus, IconTrashX } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Edit, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { showToast } from '@/components/constant/custom-toast';
//import type { ActionMenuItem } from '@/components/Models/credits-menuitem';
import type { CreditTransaction } from '@/components/Models/credit-transaction';
import type { ColumnDefinition } from '@/components/constant/data-table';
import Image from 'next/image';
import editIcon from '@/assets/edit.svg';
import type RequestBody from '@/components/Models/requestBody';

type SortState = {
  key: string;
  order: 'asc' | 'desc' | '';
};

const columnHeaders: Array<ColumnDefinition<CreditTransaction>> = [
  {
    key: 'companyName',
    label: 'Company Name',
    render: (transaction: CreditTransaction) => <span>{transaction.companyName}</span>,
  },
  {
    key: 'transactionDate',
    label: 'Date',
    render: (transaction: CreditTransaction) => (
      <span>{new Date(transaction.transactionDate).toLocaleDateString()}</span>
    ),
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (transaction: CreditTransaction) => <span>{transaction.amount}</span>,
  },
  {
    key: 'bankName',
    label: 'Name Of Bank',
    render: (transaction: CreditTransaction) => <span>{transaction.bankName}</span>,
  },
  {
    key: 'modeOfPayment',
    label: 'Mode Of Payment',
    render: (transaction: CreditTransaction) => <span>{transaction.modeOfPayment}</span>,
  },
  {
    key: 'transactionId',
    label: 'Transaction No.',
    render: (transaction: CreditTransaction) => <span>{transaction.transactionId}</span>,
  },
  {
    key: 'addCredits',
    label: 'Credit Distributed',
    render: (transaction: CreditTransaction) => <span>{transaction.addCredits}</span>,
  },
];

const DEFAULT_SORT: SortState = { key: 'createdAt', order: 'desc' };
const CreditsPage = () => {
  const menuItems = (row: CreditTransaction): MenuItem[] => {
    const creditRow = row as CreditTransaction;
    const isDeactive = creditRow.status === 'DEACTIVE';

    return [
      {
        label: 'Edit',
        icon: (
          <span
            style={{
              opacity: isDeactive ? 0.5 : 1,
              pointerEvents: isDeactive ? 'none' : 'auto',
            }}
          >
            <Image src={editIcon} alt="Edit Icon" width={16} height={16} />
          </span>
        ),
        action: () => {
          if (!isDeactive) handleEdit(creditRow.id);
        },
        disabled: isDeactive,
        hoverClass: isDeactive ? '' : 'hover:bg-blue-50 dark:hover:bg-blue-700',
        textColor: isDeactive ? 'text-gray-400' : 'text-gray-800 dark:text-blue-200',
      },
      {
        label: 'Delete',
        icon: (
          <IconTrashX
            className={`h-5 w-5 ${isDeactive ? 'text-gray-400' : 'text-red30'}`}
            style={{
              opacity: isDeactive ? 0.5 : 1,
              pointerEvents: isDeactive ? 'none' : 'auto',
            }}
          />
        ),
        action: () => {
          if (!isDeactive) {
            setSelectedDeleteId(creditRow.id);
            setDeleteDialogOpen(true);
          }
        },
        disabled: isDeactive,
        hoverClass: isDeactive ? '' : 'hover:bg-red-50 dark:hover:bg-red-700',
        textColor: isDeactive ? 'text-gray-400' : 'text-red-600 dark:text-red-400',
      },
    ];
  };

  // Selected columns (use all by default)
  const searchParams = useSearchParams();
  const getRelaventsearch = (): string => {
    const searchFilter: string | null = searchParams.get('search');
    return searchFilter ?? ''; // Use nullish coalescing for better readability
  };
  const getRelevantItemPerPage = () => {
    const item: number = Number(searchParams.get('limit')) || 10;
    const breakpoints = [5, 10, 20, 30, 50, 100];
    let closest = breakpoints[0];

    for (let i = 1; i < breakpoints.length; i++) {
      if (Math.abs(item - breakpoints[i]) < Math.abs(item - closest)) {
        closest = breakpoints[i];
      }
    }
    return closest;
  };
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
  const getRelevantPage = () => {
    const page: number = Number(searchParams.get('page')) || 1;
    return page;
  };

  const [itemsPerPage, setItemsPerPage] = useState<number>(getRelevantItemPerPage());
  const [companyData, setCompanyData] = useState<CreditTransaction[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(getRelevantPage());
  const [loadingTableData, setLoadingTableData] = useState(true);
  // Pagination and sorting states
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const isLoading = false; // Set to true while loading data
  const [sort, setSort] = useState<SortState>(getRelevantSort());
  const router = useRouter();
  const [searchVal, setSearchVal] = useState<string>(getRelaventsearch());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams(page, itemsPerPage);
  };
  // Handle items per page change

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    updateQueryParams(1, items);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingTableData(true);

      const requestBody: RequestBody = {
        page: currentPage - 1,
        size: itemsPerPage,
        sortBy: sort.key,
        sortDir: sort.order,
      };

      if (searchVal.length > 0) {
        requestBody.companyName = searchVal;
      }

      try {
        const response = await fetch(`/api/credits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyData(data?.data?.content);
          setTotalRecords(data?.data?.totalElements);
          setTotalPages(data?.data?.totalPages);
          // showToast("success", "✅ company details Successful", "");
        } else {
          showToast('error', '🚫 Error while fetching company details', 'please try later');
        }
      } catch {
        showToast('error', 'fetching data failed');
      } finally {
        setLoadingTableData(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, searchVal, sort]);

  const updateQueryParams = (page: number, limit: number) => {
    // router.push(?page=${page}&limit=${limit});
    const url = new URL(window.location.href);
    // url.searchParams.set("page", page.toString());
    // url.searchParams.set("limit", limit.toString());

    if (!page) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', page.toString());
    }

    if (!limit) {
      url.searchParams.delete('limit');
    } else {
      url.searchParams.set('limit', limit.toString());
    }

    window.history.pushState({}, '', url.toString());
  };

  const updateSortQueryParam = (sortKey: string, sortOrder: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sortkey', sortKey);
    url.searchParams.set('sortorder', sortOrder);
    window.history.pushState({}, '', url.toString());
  };
  useEffect(() => {
    updateSortQueryParam(sort.key, sort.order);
  }, [sort]);

  const handleEdit = (id: number) => {
    router.push(`credits/edit/${id}`);
    // Implement your edit logic here
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;
    setDeleteDialogOpen(false); // close dialog

    try {
      const response = await axios.post(`/api/credits/delete/${selectedDeleteId}`, {
        id: selectedDeleteId,
      });

      if (response.status === 200) {
        showToast('success', '✅ Transaction deleted successfully', '');
        setLoadingTableData(true);

        const requestBody: RequestBody = {
          page: currentPage - 1,
          size: itemsPerPage,
          sortBy: sort.key,
          sortDir: sort.order,
        };
        if (searchVal.length > 0) {
          requestBody.companyName = searchVal;
        }

        const fetchResponse = await fetch(`/api/credits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setCompanyData(data?.data?.content);
          setTotalRecords(data?.data?.totalElements);
          setTotalPages(data?.data?.totalPages);
        } else {
          showToast('error', '🚫 Error while fetching company details', 'Please try later');
        }
      }
    } catch (error) {
      showToast('error', '🚫 Error while deleting transaction');
    } finally {
      setLoadingTableData(false);
      setSelectedDeleteId(null);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoadingTableData(false);
    }, 2000);
  });
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    updateSearchQueryParams(val);
    setCurrentPage(1);
  };

  const updateSearchQueryParams = (search: string) => {
    const url = new URL(window.location.href);

    if (!search) {
      url.searchParams.delete('search');
    } else {
      url.searchParams.set('search', search.toString());
    }

    window.history.pushState({}, '', url.toString());
  };
  return (
    <DashboardLayout>
      {/* Heading Section */}
      <motion.div
        className="flex justify-between items-center py-4 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-lg sm:text-3xl text-blue130 font-bold dark:text-indigo-400"
          initial={{ opacity: 0, y: -20 }} // Start from opacity 0 and slide up
          animate={{ opacity: 1, y: 0 }} // Fade in and slide to the original position
          transition={{ duration: 0.6, ease: 'easeOut' }} // Control the timing of the animation
        >
          Credits
        </motion.h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex w-full justify-between items-center mb-6 flex-wrap gap-4"
      >
        {/* Search Filter */}
        <div className="flex w-full">
          <div className="flex items-center px-2 py-4 justify-between gap-4 flex-wrap">
            {/* Left: Search Bar & Dropdown */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full lg:w-[340px]">
                {' '}
                {/* {loadingTableData ? (
                  <Skeleton className="h-10 w-full rounded-lg dark:bg-gray-700" />
                ) : (
                  <> */}
                <Input
                  type="text"
                  placeholder="Company Search"
                  value={searchVal}
                  onChange={handleSearch}
                  className="w-full bg-gray50 dark:bg-black20 border border-gray40 dark:border-gray-600 
                            rounded-lg pl-10 pr-4 py-2 text-black dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue10 dark:focus:ring-blue-500
                            focus:border-blue10 dark:focus:border-blue-500
                            transition"
                />
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                />
                {/* </>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
          <div className="py-8 px-4">
            <DataTable
              data={companyData}
              selectedColumns={columnHeaders}
              total={totalRecords}
              current={currentPage}
              onChange={handlePageChange}
              setItemsPerPage={handleItemsPerPageChange}
              loading={isLoading}
              isAction
              itemPerPage={itemsPerPage}
              setSort={setSort}
              sort={sort}
              detailsUrl="/credits"
              defaultSortColumn={sort.key}
              type="credits"
              menuItems={menuItems}
              totalPages={totalPages}
            />
          </div>
        )}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this credit transaction? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default CreditsPage;
