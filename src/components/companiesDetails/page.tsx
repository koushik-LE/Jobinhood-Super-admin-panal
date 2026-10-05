'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileCard from '@/components/companiesDetails/companyDetails/info';
import UserDetails from '@/components/companiesDetails/companyDetails/UserDetails';
import StatsCard from '@/components/companiesDetails/companyDetails/startCard';
import StatsCard1 from '@/components/companiesDetails/companyDetails/EndCard';
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@radix-ui/react-dropdown-menu';
import TrasactionDetails from '@/components/companiesDetails/trasactionDetails/trasactionDetails';
import { showToast } from '@/components/constant/custom-toast';
import { IconArrowLeft, IconDotsVertical } from '@tabler/icons-react';
import axios from 'axios';
import Image from 'next/image';
import Deactive from '@/assets/Deactive.svg.svg';
import Active from '@/assets/Active.svg';
import useradd from '@/assets/mingcute_user-add-fill.svg';
import creditsplus from '@/assets/mingcute_add-line.svg';
import { PopupMessage } from '../constant/popup-message';

interface CompanyData {
  id: string;
  companyName: string;
  status: string;
}

export default function CompanyDetails() {
  const searchParams = useSearchParams();

  const getRelaventTab = useCallback((): string => {
    const DEFAULT_TAB = 'CompanyInfo';
    const tab: string | null = searchParams.get('tab');
    return tab ?? DEFAULT_TAB;
  }, [searchParams]);

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(getRelaventTab());
  const [userCount, setUserCount] = useState<number>(0);

  const [statusPopupOpen, setStatusPopupOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'DEACTIVE' | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          '/api/company/getcompany',
          { id },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        setCompanyData(response.data.data);
      } catch (error) {
        console.error('Error fetching company data:', error);
        showToast('error', 'Failed to fetch company details');
      }
    };

    fetchData();
  }, [id]);

  const updateTabQueryParams = (tab: string) => {
    const url = new URL(window.location.href);
    if (!tab) {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab.toString());
    }
    // window.history.pushState({}, '', url.toString()); replacing to fix back navigation issue
    window.history.replaceState({}, '', url.toString());
  };

  const handleTabSwitch = (val: string) => {
    setActiveTab(val);
    updateTabQueryParams(val);
  };

  const handleStatusChange = useCallback(
    async (currentStatus: string) => {
      if (!companyData) return;

      try {
        setIsStatusUpdating(true);

        const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE';

        const response = await axios.patch(`/api/company/status/${id}`, {
          status: newStatus,
          id,
        });

        if (response.data) {
          showToast(
            'success',
            `Company ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
            ''
          );

          setCompanyData({
            ...companyData,
            status: newStatus,
          });

          setStatusPopupOpen(false);
          setPendingStatus(null);
        }
      } catch (error) {
        console.error('Error changing company status:', error);

        showToast('error', 'Failed to change company status', 'Please try again later');
      } finally {
        setIsStatusUpdating(false);
      }
    },
    [companyData, id]
  );

  const handleActivate = useCallback(() => {
    if (!companyData) return;

    setPendingStatus('ACTIVE');
    setStatusPopupOpen(true);
  }, [companyData]);

  const handleDeactivate = useCallback(() => {
    if (!companyData) return;

    setPendingStatus('DEACTIVE');
    setStatusPopupOpen(true);
  }, [companyData]);

  const handleConfirmStatusChange = useCallback(() => {
    if (!pendingStatus) return;

    const currentStatus = pendingStatus === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE';

    handleStatusChange(currentStatus);
  }, [pendingStatus, handleStatusChange]);

  const handleAddCredits = useCallback(() => {
    if (!companyData) return;
    router.push(
      `/credits/addCredits?companyId=${id}&companyName=${encodeURIComponent(
        companyData.companyName
      )}`
    );
  }, [companyData, id, router]);

  const handleAddUser = useCallback(() => {
    if (!companyData) return;
    router.push(
      `/companies/addUser?companyId=${id}&companyName=${encodeURIComponent(
        companyData.companyName
      )}`
    );
  }, [companyData, id, router]);

  const menuItems = useMemo(() => {
    const baseItems = [
      {
        label: 'Add Credits',
        icon: (
          <Image
            src={creditsplus}
            alt="credits Plus icon"
            width={20}
            height={20}
            className="gap-2"
          />
        ),
        action: handleAddCredits,
        hoverClass: 'hover:bg-blue-50 dark:hover:bg-blue-700',
        textColor: 'text-white',
        disabled: companyData?.status === 'DEACTIVE',
      },
      {
        label: 'Add User',
        icon: <Image src={useradd} alt="User Plus icon" width={20} height={20} className="gap-2" />,
        action: handleAddUser,
        hoverClass: 'hover:bg-blue-50 dark:hover:bg-blue-700',
        textColor: 'text-white',
        disabled: companyData?.status === 'DEACTIVE',
      },
    ];

    const statusItem =
      companyData?.status === 'ACTIVE'
        ? {
            label: 'Deactivate',
            icon: (
              <div className="relative">
                <Image
                  src={Deactive}
                  alt="Deactivate Icon"
                  width={20}
                  height={20}
                  className="gap-2"
                />
              </div>
            ),
            action: handleDeactivate,
            hoverClass: 'hover:bg-red-50 dark:hover:bg-red-700',
            textColor: 'text-red-600 dark:text-red-400',
            disabled: false,
          }
        : {
            label: 'Activate',
            icon: (
              <div className="relative">
                <Image src={Active} alt="Activate Icon" width={20} height={20} className="gap-2" />
                <div className="absolute -right-1 -top-1 h-2.5 w-2.5 border border-white" />
              </div>
            ),
            action: handleActivate,
            hoverClass: 'hover:bg-green-50 dark:hover:bg-green-700',
            textColor: 'text-green-600 dark:text-green-400',
            disabled: false,
          };

    return [...baseItems, statusItem];
  }, [companyData?.status, handleAddCredits, handleAddUser, handleActivate, handleDeactivate]);

  return (
    <div>
      {/* Heading Section */}
      <motion.div
        className="flex items-center justify-between py-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="flex items-center">
          <IconArrowLeft
            className="h-8 w-8 text-white mr-2 cursor-pointer"
            onClick={() => {
              if (activeTab === 'TransactionDetails') {
                handleTabSwitch('CompanyInfo');
              } else {
                router.back(); // Navigate to the previous page
              }
            }}
          />

          <motion.h1
            className="text-lg sm:text-3xl text-blue130 font-bold dark:text-indigo-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {activeTab === 'CompanyInfo' ? 'Company Details' : 'Transaction Details'}
          </motion.h1>
        </div>

        {/* Right-aligned IconDotsVertical */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 border border-white/40 rounded hover:bg-white/80  bg-white/20. ">
              <IconDotsVertical className="h-6 w-6 text-white hover:text-black" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-40 bg-white dark:bg-blue40 shadow-md rounded-md p-2 text-left"
            side="bottom"
            align="end"
          >
            {menuItems.map((item, index) => {
              const isDisabled =
                companyData?.status?.toLowerCase() === 'deactive' &&
                ['Add User', 'Add Credits'].includes(item.label);

              return (
                <DropdownMenuItem
                  key={index}
                  onClick={!item.disabled ? item.action : undefined}
                  className={`flex items-center gap-2 p-2 rounded ${
                    item.disabled
                      ? 'cursor-not-allowed text-gray-400'
                      : `cursor-pointer ${item.textColor} ${item.hoverClass}`
                  }`}
                >
                  <span className={`${item.disabled ? 'opacity-50 text-gray-400' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full justify-start">
        <TabsList
          className="
    relative
    inline-grid
    grid-cols-2
    h-[66px]
    w-fit
    min-w-[470px]
    p-0
    overflow-hidden
    rounded-[10px]
    border
    border-[#3A3A4A]
    bg-[#191827]
    dark:bg-[#191827]
  "
        >
          <TabsTrigger
            value="CompanyInfo"
            onClick={() => handleTabSwitch('CompanyInfo')}
            className="
      relative
      h-full
      rounded-none
      border-0
      bg-transparent
      px-6
      sm:px-8
      text-[16px]
      sm:text-[18px]
      font-semibold
      text-white
      shadow-none
      transition-all
      duration-300

      data-[state=inactive]:bg-transparent
      data-[state=inactive]:text-white

      data-[state=active]:bg-transparent
      data-[state=active]:text-[#6C2CFF]

      hover:bg-transparent
      hover:text-[#6C2CFF]

      focus-visible:ring-0
      focus-visible:ring-offset-0

      after:absolute
      after:bottom-0
      after:left-0
      after:h-[3px]
      after:w-full
      after:bg-[#6C2CFF]
      after:opacity-0
      after:transition-opacity
      after:duration-300

      data-[state=active]:after:opacity-100
    "
          >
            Company Info
          </TabsTrigger>

          <TabsTrigger
            value="TransactionDetails"
            onClick={() => handleTabSwitch('TransactionDetails')}
            className="
      relative
      h-full
      rounded-none
      border-0
      bg-transparent
      px-6
      sm:px-8
      text-[16px]
      sm:text-[18px]
      font-semibold
      text-white
      shadow-none
      transition-all
      duration-300

      data-[state=inactive]:bg-transparent
      data-[state=inactive]:text-white

      data-[state=active]:bg-transparent
      data-[state=active]:text-[#6C2CFF]

      hover:bg-transparent
      hover:text-[#6C2CFF]

      focus-visible:ring-0
      focus-visible:ring-offset-0

      after:absolute
      after:bottom-0
      after:left-0
      after:h-[3px]
      after:w-full
      after:bg-[#6C2CFF]
      after:opacity-0
      after:transition-opacity
      after:duration-300

      data-[state=active]:after:opacity-100
    "
          >
            Transaction Details
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="CompanyInfo"
          className="rounded-md transition-all duration-500 ease-in-out"
        >
          <div>
            <div className="flex flex-col lg:flex-row gap-3 items-stretch mb-3">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-7/8 flex flex-col h-80 overflow-hidden"
              >
                <div className=" rounded-2xl shadow-3xl p-2 h-full transition-all duration-300 ease-in-out">
                  <div className="h-full overflow-hidden">
                    <ProfileCard id={id} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-2/4 flex flex-col h-80"
              >
                <div className=" rounded-2xl shadow-3xl p-2 h-full transition-all duration-300 ease-in-out">
                  <StatsCard id={id} userCount={userCount} />
                </div>
              </motion.div>
            </div>
          </div>
          <div>
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="w-full lg:w-7/8 flex flex-col h-[600px] overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="h-full"
                >
                  <div className="rounded-2xl shadow-3xl p-3 transition-all duration-300 ease-in-out h-full">
                    <div className="overflow-x-auto h-full">
                      <UserDetails id={id} setUserCount={setUserCount} />
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="w-full lg:w-2/4 flex flex-col h-[600px] overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="h-full"
                >
                  <div
                    id="endcard-container"
                    className=" rounded-2xl shadow-3xl p-4 transition-all duration-300 ease-in-out h-full"
                  >
                    <StatsCard1 id={id} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="TransactionDetails"
          className="rounded-md transition-all duration-500 ease-in-out"
        >
          <div>
            <TrasactionDetails companyStatus={companyData?.status} />{' '}
            {/* adding this to Block edit/delete when company is deactivated. */}
          </div>
        </TabsContent>
      </Tabs>

      <PopupMessage
        isOpen={statusPopupOpen}
        onClose={() => {
          if (!isStatusUpdating) {
            setStatusPopupOpen(false);
            setPendingStatus(null);
          }
        }}
        variant="warning"
        title={pendingStatus === 'DEACTIVE' ? 'Deactivate Company?' : 'Activate Company?'}
        message={
          pendingStatus === 'DEACTIVE'
            ? `Are you sure you want to deactivate ${
                companyData?.companyName || 'this company'
              }? Users will no longer be able to access company-related actions.`
            : `Are you sure you want to activate ${
                companyData?.companyName || 'this company'
              }? The company will be available for users again.`
        }
        hideCloseButton={isStatusUpdating}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setStatusPopupOpen(false);
              setPendingStatus(null);
            },
            variant: 'outline',
            className: 'sm:w-36',
          },
          {
            label: isStatusUpdating
              ? 'Updating...'
              : pendingStatus === 'DEACTIVE'
                ? 'Deactivate'
                : 'Activate',
            onClick: handleConfirmStatusChange,
            className:
              pendingStatus === 'DEACTIVE' ? 'sm:w-36 !bg-red-600 hover:!bg-red-700' : 'sm:w-36',
          },
        ]}
      />
    </div>
  );
}
