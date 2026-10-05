'use client';
import DataTable from '@/components/constant/data-table';
import type { DataRow } from '@/components/constant/data-table';
import DashboardLayout from '../dashboard-layout';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/custom-skeletons/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { IconPlus } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Deactive from '@/assets/Deactive.svg.svg';
import Active from '@/assets/Active.svg';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { Building, ChevronDown, Edit, Plus, Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEFAULT_STATUS } from '@/components/constant/const-values';
import SubcriberIcon from '@/Icons/companyDetails-Icons/subcriber.svg';
import { showToast } from '@/components/constant/custom-toast';
import axios from 'axios';
import type Company from '@/components/Models/companies-company';
import type requestBody from '@/components/Models/requestBody';
import type CompanyApiResponse from '@/components/Models/companies-companyApiResponse';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // adjust this path as needed
type SortState = { key: string; order: 'asc' | 'desc' | '' };

const getDisabledTextClass = (status: string) =>
  status !== 'ACTIVE' ? 'text-[#9B9B9B] cursor-pointer' : '';

const STATUS_LABELS: Record<string, string> = {
  DEFAULT_STATUS: 'All',
  ACTIVE: 'ACTIVE',
  DEACTIVE: 'INACTIVE',
};

interface CompanyRow extends DataRow {
  id: string;
  companyName: string;
  status: string;
  contactPerson: string;
  contactEmail: string;
  credits: number;
  revenue: string;
  subcriberType: string;
  avatar?: string;
  // Add other properties as needed
}

const columnHeaders = [
  {
    key: 'companyName',
    label: 'Company Name',
    render: (row: DataRow) => {
      const companyRow = row as CompanyRow;
      const isDisabled = companyRow.status !== 'ACTIVE';
      return (
        <div className={`flex items-center space-x-3 ${getDisabledTextClass(companyRow.status)}`}>
          <Avatar className="w-8 h-8 rounded-full border dark:border-gray-600 border-gray-300 shadow-md transition-all duration-300">
            {companyRow.avatar ? (
              <AvatarImage
                src={companyRow.avatar}
                alt={companyRow.companyName}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <AvatarFallback className="w-full h-full flex items-center justify-center text-lg font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 transition-all duration-300">
                {companyRow.companyName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <span>{companyRow.companyName}</span>
          {companyRow.subcriberType === 'SUBSCRIBER' && (
            <Image src={SubcriberIcon} alt="Subscriber" width={20} height={20} />
          )}
        </div>
      );
    },
  },
  {
    key: 'contactPerson',
    label: 'Contact Person',
    render: (row: CompanyRow) => (
      <span className={getDisabledTextClass(row.status)}>{row.contactPerson}</span>
    ),
  },
  {
    key: 'contactEmail',
    label: 'Email ID',
    render: (row: CompanyRow) => (
      <span className={getDisabledTextClass(row.status)}>{row.contactEmail}</span>
    ),
  },
  {
    key: 'creditDistribute',
    label: 'Credits',
    render: (row: CompanyRow) => (
      <span className={getDisabledTextClass(row.status)}>{row.credits}</span>
    ),
  },
  {
    key: 'revenue',
    label: 'Revenue',
    render: (row: CompanyRow) => (
      <span className={getDisabledTextClass(row.status)}>{row.revenue}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: CompanyRow) => {
      const displayStatus = STATUS_LABELS[row.status] ?? row.status;
      return <span className={getDisabledTextClass(row.status)}>{displayStatus}</span>;
    },
  },
];

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled: boolean;
  hoverClass: string;
  textColor: string;
}

const DEFAULT_SORT: SortState = { key: 'createdAt', order: 'desc' };

const CompanyPage = () => {
  const menuItems = (row: DataRow): MenuItem[] => {
    const company = row as unknown as CompanyRow;

    const isDeactive = company.status !== 'ACTIVE';

    const getItemStyles = (enabled: boolean) => ({
      hoverClass: enabled ? 'hover:bg-blue-50 dark:hover:bg-blue-700 hover:border-0' : '',
      textColor: enabled ? 'text-gray-800 dark:text-blue-200' : 'border:none text-gray60',
      iconColor: enabled ? 'text-blue-800' : 'text-gray60',
    });

    const baseItems: MenuItem[] = [
      {
        label: 'Edit',
        icon: <Edit className={`h-4 w-4 ${getItemStyles(!isDeactive).iconColor}`} />,
        action: () => {
          if (!isDeactive) handleEdit(company.id);
        },
        disabled: isDeactive,
        ...getItemStyles(!isDeactive),
      },
      {
        label: 'Add Credits',
        icon: <Plus className={`h-4 w-4 ${getItemStyles(!isDeactive).iconColor}`} />,
        action: () => {
          if (!isDeactive) handleAddCredits(company.id, company.companyName);
        },
        disabled: isDeactive,
        ...getItemStyles(!isDeactive),
      },
      {
        label: 'Add User',
        icon: <UserPlus className={`h-4 w-4 ${getItemStyles(!isDeactive).iconColor}`} />,
        action: () => {
          if (!isDeactive) handleAddUser(company.id, company.companyName);
        },
        disabled: isDeactive,
        ...getItemStyles(!isDeactive),
      },
    ];

    const isActive = company.status === 'ACTIVE';

    const statusItem: MenuItem = isActive
      ? {
          label: 'Deactivate',
          icon: (
            <div className="relative">
              <Image src={Deactive} alt="Deactivate Icon" className="h-4 w-4 text-red-600" />
            </div>
          ),
          action: () => handleDeactivate(company.id),
          disabled: false,
          hoverClass: 'hover:bg-red-50 dark:hover:bg-red-700',
          textColor: 'text-red-600 dark:text-red-400',
        }
      : {
          label: 'Activate',
          icon: (
            <div className="relative">
              <Image src={Active} alt="Activate Icon" className="h-4 w-4 text-green-600" />
            </div>
          ),
          action: () => handleActivate(company.id),
          disabled: false,
          hoverClass: 'hover:bg-green-50 dark:hover:bg-green-700',
          textColor: 'text-green-600 dark:text-green-400',
        };

    return [...baseItems, statusItem];
  };

  const searchParams = useSearchParams();
  const getRelaventStatus = (): string => {
    const statusFilter: string | null = searchParams.get('status');
    if (!statusFilter || statusFilter === DEFAULT_STATUS) {
      return statusFilter ?? DEFAULT_STATUS;
    }
    return statusFilter;
  };

  const getRelevantSubscriber = (): string => {
    const statusFilter: string | null = searchParams.get('subscriber');
    return statusFilter ?? DEFAULT_STATUS;
  };

  const getRelaventsearch = (): string => {
    const searchFilter: string | null = searchParams.get('search');
    return searchFilter ?? '';
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

  const [selectedFilter, setSelectedFilter] = useState(getRelaventStatus());
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState<string>(getRelaventsearch());
  const [companyData, setCompanyData] = useState<CompanyRow[]>([]);
  const [loadingTableData, setLoadingTableData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(getRelevantItemPerPage());
  const [currentPage, setCurrentPage] = useState<number>(getRelevantPage());
  const [isSubscriberOpen, setIsSubscriberOpen] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<string>(getRelevantSubscriber());
  const isLoading = false;
  const [sort, setSort] = useState<SortState>(getRelevantSort());
  const router = useRouter();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams(page, itemsPerPage);
  };

  const transformData = (input: CompanyApiResponse) => {
    const transformed = {
      id: input.id,
      transactionDate: new Date().toISOString().split('T')[0],
      amount: 0.0,
      transactionId: null,
      modeOfPayment: input.subscriptionType || '',
      bankName: null,
      credits: input.creditDistribute,
      companyId: input.id,
      companyName: input.companyName,
      subcriberType: input.subscriptionType,
      contactPerson: input.contactPerson || '',
      contactEmail: input?.contactEmail || 'N/A',
      userPhoneNumber: input.users?.[0]?.phoneNumber || '',
      companyAddressLine: input.address?.addressLine || '',
      companyCity: input.address?.city || '',
      companyState: input.address?.state || '',
      companyCountry: input.address?.country || '',
      companyPincode: input.address?.pinCode || '',
      status: input?.status,
      revenue: input?.revenue || '',
    };
    return transformed;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingTableData(true);
      const requestBody: requestBody = {
        page: currentPage - 1,
        size: itemsPerPage,
        sortBy: sort.key,
        sortDir: sort.order,
      };

      if (searchVal.length > 0) {
        requestBody.companyName = searchVal;
      }
      if (selectedFilter && selectedFilter !== 'All') {
        requestBody.status = selectedFilter;
      }
      if (subscription && subscription !== 'All') {
        requestBody.subscriptionType = subscription;
      }

      try {
        const response = await axios.post('/api/company', requestBody, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response) {
          const data = response.data;
          const transformedArray = data.data.content.map(transformData);
          setCompanyData(transformedArray);
          setTotalRecords(data?.data?.totalElements);
          setTotalPages(data?.data?.totalPages);
        } else {
          showToast('error', '🚫 Error while fetching company details', `please try later`);
        }
      } catch {
        showToast('error', 'fetching data is  failed');
      } finally {
        setLoadingTableData(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, searchVal, selectedFilter, sort, subscription]);

  const handleEdit = (id: string) => {
    router.push(`/companies/edit/${id}`);
  };

  const handleAddCredits = (id: string, name: string) => {
    router.push(`/credits/addCredits?companyId=${id}&companyName=${encodeURIComponent(name)}`);
  };

  const handleAddUser = (id: string, name: string) => {
    router.push(`/companies/addUser?companyId=${id}&companyName=${encodeURIComponent(name)}`);
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE';
      const response = await axios.patch(`/api/company/status/${id}`, {
        status: newStatus,
        id,
      });

      if (response.status === 200) {
        setLoadingTableData(true);
        const requestBody: requestBody = {
          page: currentPage - 1,
          size: itemsPerPage,
          sortBy: sort.key,
          sortDir: sort.order,
        };
        if (searchVal.length > 0) {
          requestBody.companyName = searchVal;
        }
        if (selectedFilter && selectedFilter !== 'All') {
          requestBody.status = selectedFilter;
        }
        try {
          const response = await axios.post('/api/company', requestBody, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (response) {
            const data = response.data;
            const transformedArray = data.data.content.map(transformData);
            setCompanyData(transformedArray);
            setTotalRecords(data?.data?.totalElements);
            setTotalPages(data?.data?.totalPages);
            // showToast("success", "✅ company details Successful", "");
          } else {
            // Handle error if the response is not OK
            showToast('error', '🚫 Error while fetching company details ', `please try later`);
          }
        } catch {
          showToast('error', 'fetching data failed');
          // Handle fetch error
        } finally {
          setLoadingTableData(false); // Set loading to false in `finally` block
        }
      }

      if (response.data) {
        showToast(
          'success',
          `Company ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
          ''
        );
      }
    } catch {
      showToast('error', 'Failed to change company status', 'Please try again later');
    }
  };

  const handleActivate = (id: string) => {
    handleStatusChange(id, 'DEACTIVE');
  };

  const handleDeactivate = (id: string) => {
    handleStatusChange(id, 'ACTIVE');
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

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    updateQueryParams(1, items);
  };

  const handleSubscriberChange = (val: string) => {
    setSubscription(val);
    updateSubscriberQueryParams(val);
    setCurrentPage(1);
  };

  const handleAddCompany = (val: string) => {
    if (val === 'company') {
      router.push('/companies/addCompany');
    } else {
      router.push('/companies/addUser');
    }
  };

  const updateStatusQueryParams = (status: string) => {
    const url = new URL(window.location.href);

    if (!status) {
      url.searchParams.delete('status');
    } else {
      url.searchParams.set('status', status.toString());
    }

    window.history.pushState({}, '', url.toString());
  };

  const updateSubscriberQueryParams = (subscriber: string) => {
    const url = new URL(window.location.href);

    if (!subscriber) {
      url.searchParams.delete('subscriber');
    } else {
      url.searchParams.set('subscriber', subscriber.toString());
    }

    window.history.pushState({}, '', url.toString());
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

    window.history.pushState({}, '', url.toString());
  };

  const handleStatus = (val: string) => {
    setSelectedFilter(val);
    updateStatusQueryParams(val);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    setCurrentPage(1);
    updateSearchQueryParams(val);
  };

  return (
    <DashboardLayout>
      <motion.div
        className="flex justify-between items-center py-4 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-lg sm:text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          List of Companies
        </motion.h1>
      </motion.div>

      <div className="w-full flex flex-col lg:flex-row md:items-center md:justify-between gap-4 mb-3 py-3 px-2">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative w-full md:w-[400px]">
            <Input
              type="text"
              placeholder="Company Search"
              value={searchVal}
              onChange={handleSearch}
              className="w-full bg-gray50 dark:bg-black20 border border-gray40 dark:border-gray-600 rounded-md pl-10 
                         pr-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue10 dark:focus:ring-blue-500 
                         focus:border-blue10 dark:focus:border-blue-500 transition"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            />
          </div>

          <div className="flex flex-col w-full md:w-[150px]">
            <label className="text-sm text-black-700 dark:text-black-300 pl-1">Status</label>
            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center w-full justify-between border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray70 px-4 py-2 mb-4 rounded-md shadow-sm transition 
                 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                  {STATUS_LABELS[selectedFilter] ?? 'All'}
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="z-50 w-full md:w-[160px] overflow-hidden rounded-md bg-white dark:bg-gray70 
               shadow-lg border border-gray-200 dark:border-gray-600 text-black dark:text-white"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <DropdownMenuItem
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => handleStatus('All')}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => handleStatus('ACTIVE')}
                  >
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => handleStatus('DEACTIVE')}
                  >
                    Inactive
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col w-full md:w-[180px]">
            <label className="text-sm text-black-700 dark:text-black-300 pl-1">
              Subscription Type
            </label>
            <DropdownMenu onOpenChange={setIsSubscriberOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center w-full justify-between border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray70 px-4 py-2 mb-4 rounded-md shadow-sm transition 
                             hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                  {subscription}
                  <motion.div
                    animate={{ rotate: isSubscriberOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="z-50 w-full md:w-[160px] overflow-hidden rounded-md bg-white dark:bg-gray70 
              shadow-lg border border-gray-200 dark:border-gray-600 text-black dark:text-white"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <DropdownMenuItem
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => handleSubscriberChange('All')}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => handleSubscriberChange('TRIAL')}
                  >
                    Trial
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => handleSubscriberChange('SUBSCRIBER')}
                  >
                    Subscriber
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full flex justify-start md:justify-start lg:justify-end">
          {loadingTableData ? (
            <Skeleton className="h-10 w-full md:w-[140px] rounded-md dark:bg-gray-700" />
          ) : (
            <motion.button
              className="md:w-auto bg-gradient-to-r from-[#F02AF3] to-[#7B2FFF]   text-white px-6 py-2 rounded-md whitespace-nowrap hover:bg-blue140 dark:hover:bg-blue-500 transition flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddCompany('company')}
            >
              <IconPlus size={20} />
              Add New Company
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        className="transition-all duration-500 ease-in-out"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {loadingTableData ? (
          <div className="mt-2">
            <TableSkeleton rowCount={itemsPerPage} />
          </div>
        ) : (
          <div className="p-8 rounded-lg">
            <DataTable<CompanyRow>
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
              detailsUrl="/companies"
              defaultSortColumn={sort.key}
              type="companies"
              menuItems={menuItems}
              totalPages={totalPages}
            />
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default CompanyPage;
