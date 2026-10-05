'use client';
import DataTable from '@/components/constant/data-table';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Building, Edit } from 'lucide-react';
import TableSkeleton from '@/components/custom-skeletons/table-skeleton';
import { DEFAULT_STATUS } from '@/components/constant/const-values';
import axios from 'axios';
import { showToast } from '@/components/constant/custom-toast';
import type RequestBody from '@/components/Models/requestBody';

type SortState = {
  key: string;
  order: 'asc' | 'desc' | '';
};

interface ColumnDefinition<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
}

interface Props {
  companyStatus?: string;
}

const DEFAULT_SORT: SortState = { key: 'createdAt', order: 'desc' };

const columnHeaders: Array<ColumnDefinition<Transaction>> = [
  {
    key: 'companyName',
    label: 'Company Name',
    render: transaction => <span>{transaction.companyName}</span>,
  },
  {
    key: 'transactionDate',
    label: 'Date',
    render: transaction => <span>{transaction.transactionDate}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    render: transaction => <span>{transaction.amount}</span>,
  },
  {
    key: 'bankName',
    label: 'Name Of Bank',
    render: transaction => <span>{transaction.bankName}</span>,
  },
  {
    key: 'modeOfPayment',
    label: 'Mode Of Payment',
    render: transaction => <span>{transaction.modeOfPayment}</span>,
  },
  {
    key: 'transactionId',
    label: 'Transaction No.',
    render: transaction => <span>{transaction.transactionId}</span>,
  },
  {
    key: 'addCredits',
    label: 'Credit Distributed',
    render: transaction => <span>{transaction.addCredits}</span>,
  },
];

type Transaction = {
  id: string;
  companyId: string;
  companyName: string;
  transactionDate: string;
  amount: number;
  bankName: string;
  modeOfPayment: string;
  transactionId: string;
  addCredits: number;
  deleted: boolean;
};

const TrasactionDetails: React.FC<Props> = ({ companyStatus }) => {
  const searchParams = useSearchParams();
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

  const isLoading = false;
  const router = useRouter();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [transationData, setTransationData] = useState<Transaction[]>([]);
  // Initialize details as null or with a default structure. Type includes 'status' for clarity.
  const [details, SetDetails] = useState<{ status: string } | null>(null);

  const params = useParams();
  const [itemsPerPage, setItemsPerPage] = useState<number>(getRelevantItemPerPage());
  const [currentPage, setCurrentPage] = useState<number>(getRelevantPage());
  const [sort, setSort] = useState<SortState>(getRelevantSort());
  const [loadingTableData, setLoadingTableData] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  // Determine if the actions should be globally disabled based on `details?.status`
  //  const areActionsDisabled = details?.status === 'DEACTIVE';
  const areActionsDisabled = companyStatus?.toUpperCase() === 'DEACTIVE';

  const menuItems = (row: Transaction) => [
    {
      label: 'Edit',
      icon: (
        <Edit className={`h-4 w-4 ${areActionsDisabled ? 'text-gray-400' : 'text-blue-800'}`} />
      ),
      action: () => handleEdit(row.id, row.companyId, row.companyName),
      hoverClass: areActionsDisabled ? '' : 'hover:bg-blue-50 dark:hover:bg-blue-700',
      textColor: areActionsDisabled ? 'text-gray-400' : 'text-gray-800 dark:text-blue-200',
      disabled: areActionsDisabled, // Disable based on company status
      disabledClass: 'opacity-50 cursor-not-allowed',
    },
    {
      label: 'Delete',
      icon: (
        <div className="relative">
          <Building
            className={`h-4 w-4 ${areActionsDisabled ? 'text-gray-400' : 'text-red-600'}`}
          />
          <div
            className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white ${
              areActionsDisabled ? 'bg-gray-400' : 'bg-red-400'
            }`}
          />
        </div>
      ),
      action: () => {
        if (!areActionsDisabled) {
          setSelectedDeleteId(row.id);
          setDeleteDialogOpen(true);
        }
      },
      hoverClass: areActionsDisabled ? '' : 'hover:bg-red-50 dark:hover:bg-red-700',
      textColor: areActionsDisabled ? 'text-gray-400' : 'text-red-600 dark:text-red-400',
      disabled: areActionsDisabled, // Disable based on company status
      disabledClass: 'opacity-50 cursor-not-allowed',
    },
  ];

  const handleEdit = (creditId: string, id: string, name: string) => {
    // Prevent action if company is DEACTIVE
    if (areActionsDisabled) {
      //showToast('error', 'Company is DEACTIVE.');
      return;
    }
    router.push(
      `/credits/edit/${creditId}?companyId=${id}&companyName=${encodeURIComponent(name)}`
    );
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      const response = await axios.post(`/api/credits/delete/${selectedDeleteId}`, {
        id: selectedDeleteId,
      });

      if (response.status === 200) {
        showToast('success', '✅ Transaction deleted successfully', '');
        setTransationData(prevData => prevData.filter(item => item.id !== selectedDeleteId));
        setTotalRecords(prev => prev - 1);

        if (transationData.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to delete transaction');
      }
    } catch {
      showToast('error', '🚫 Error while deleting transaction', 'Please try again later');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingTableData(true);
      const requestBody: RequestBody = {
        page: currentPage - 1,
        size: itemsPerPage,
        sortBy: sort.key,
        sortDir: sort.order,
        id: params.id ?? '',
      };

      try {
        const response = await fetch(`/api/credits/getByCompany`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const responseData = await response.json();
          // Assuming responseData.data contains the company-level details including status
          // and transactionDetails is an array within it.
          SetDetails(responseData?.data || null);
          const transactions = responseData?.data?.content || [];
          const activeTransactions = transactions.filter((t: Transaction) => !t.deleted);
          setTransationData(activeTransactions);
          setTotalRecords(activeTransactions.length);
          setTotalPages(Math.ceil(activeTransactions.length / itemsPerPage));
        } else {
          showToast('error', '🚫 Error while fetching company details ', `please try later`);
        }
      } catch {
        showToast('error', 'Failed to fetch data');
      } finally {
        setLoadingTableData(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, sort, params.id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    updateQueryParams(1, items);
  };

  const updateQueryParams = (page: number, limit: number) => {
    const url = new URL(window.location.href);

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

    // window.history.pushState({}, '', url.toString());
    window.history.replaceState({}, '', url.toString());
  };

  const updateSortQueryParam = (sortKey: string, sortOrder: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sortkey', sortKey);
    url.searchParams.set('sortorder', sortOrder);
    // window.history.pushState({}, '', url.toString());
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'TransactionDetails') {
      updateSortQueryParam(sort.key, sort.order);
    }
  }, [sort, searchParams]);

  return (
    <div>
      {/* Table Section */}
      <motion.div
        className="transition-all duration-500 ease-in-out mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {loadingTableData ? (
          <div className="mt-1">
            <TableSkeleton rowCount={itemsPerPage} />
          </div>
        ) : (
          <div className="p-4 rounded-lg">
            <DataTable
              data={transationData}
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
                Are you sure you want to delete this transaction? This action cannot be undone.
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
    </div>
  );
};

export default TrasactionDetails;
