'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { number, z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  Landmark,
  ReceiptText,
  ArrowRightLeft,
  IndianRupee,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import AppleLogo from '@/assets/appleLogo.svg';
import { PopupMessage } from '@/components/constant/popup-message';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { showToast } from '../constant/custom-toast';
import DashboardLayout from '@/app/dashboard-layout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import type Company from '../Models/companies-company';
import axios from 'axios';
import type { Companydetails } from '../Models/getcomany';

// Add these new Redux actions to your existing imports
const setCompanyFormData = (data: Company) => ({
  type: 'constant/setCompanyFormData',
  payload: data,
});

const clearCompanyFormData = () => ({
  type: 'constant/clearCompanyFormData',
});

// Define the validation schema using Zod
const formSchema = z.object({
  transactionDate: z
    .string()
    .min(1, 'Transaction date is required')
    .refine(
      val => {
        const input = new Date(val);
        const today = new Date();

        // Convert both dates to YYYY-MM-DD string format
        const inputDate = input.toISOString().split('T')[0];
        const todayDate = today.toISOString().split('T')[0];

        return inputDate <= todayDate;
      },
      {
        message: 'Transaction date cannot be in the future',
      }
    ),

  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a valid number',
    })
    .positive('Amount must be greater than zero')
    .optional(),

  transactionId: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return; // skip if empty

      if (val.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 6,
          type: 'string',
          inclusive: true,
          message: 'Transaction ID must be at least 6 characters long',
        });
      }

      if (val.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 50,
          type: 'string',
          inclusive: true,
          message: 'Transaction ID cannot exceed 50 characters',
        });
      }
    }),

  modeOfPayment: z
    .string()
    .optional()
    .refine(val => val === undefined || val.length >= 0 || val.trim() !== '', {
      message: 'Please select a valid payment mode',
    }),

  bankName: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;

      if (val.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 3,
          type: 'string',
          inclusive: true,
          message: 'Bank name must be at least 3 characters long',
        });
      }

      if (val.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 50,
          type: 'string',
          inclusive: true,
          message: 'Bank name cannot exceed 50 characters',
        });
      }

      if (!/^[a-zA-Z\s]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bank name can only contain letters and spaces',
        });
      }
    }),

  addCredits: z
    .number({
      required_error: 'Credits value is required',
      invalid_type_error: 'Credits must be a valid number',
    })
    .positive('Credits must be greater than zero'),
});

export default function AddCreditsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSuccessOpen2, setIsSuccessOpen2] = useState(false);
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const companyName = searchParams.get('companyName');
  const isSubscriptionChange = searchParams.get('isSubscriptionChange') === 'true';
  const previousType = searchParams.get('previousType');
  const router = useRouter();
  const [isEmailExists, setIsEmailExists] = useState(false);
  const [addMEssage, setAddMessage] = useState<string>('');
  const dispatch = useDispatch();
  const [fetchedCompanyDetails, setFetchedCompanyDetails] = useState<Companydetails | null>(null);

  const logoData = useSelector((state: RootState) => state.constantReducer.logoData);
  const reduxCompanyDetails = useSelector(
    (state: RootState) => state.constantReducer.companyDeatils
  );
  const logoUrl = logoData ? `data:image/png;base64,${logoData}` : AppleLogo;

  // using for unsaved warning popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);
  const isIntentionalNav = useRef(false);

  // Initialize React Hook Form with Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      amount: undefined,
      transactionId: '',
      modeOfPayment: '',
      bankName: '',
      addCredits: undefined,
    },
  });

  const { isSubmitting } = form.formState;
  const { isDirty } = form.formState;

  const [showBackToCompany, setShowBackToCompany] = useState(false);

  // Add useEffect to fetch company details when needed
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (companyId && isSubscriptionChange) {
        try {
          const response = await axios.post(
            '/api/company/getcompany',
            { id: companyId },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (response.status === 200) {
            setFetchedCompanyDetails(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching company details:', error);
          showToast('error', 'Failed to fetch company details');
        }
      }
    };

    fetchCompanyDetails();
  }, [companyId, isSubscriptionChange]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!companyId && reduxCompanyDetails) {
      // For new company creation
      const payload = {
        ...reduxCompanyDetails,
        transactionDetails: [
          {
            transactionDate: values.transactionDate || null,
            amount: values.amount || null,
            transactionId: values.transactionId || null,
            modeOfPayment: values.modeOfPayment || null,
            bankName: values.bankName || null,
            addCredits: values.addCredits || null,
          },
        ],
      };

      try {
        const response = await axios.post('/api/company/addcompany', payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          dispatch(clearCompanyFormData());
          // setIsSuccessOpen(true);
          setAddMessage('add Company');
          setShowBackToCompany(false);
          setIsSuccessOpen2(true);
          form.reset();
          // showToast('success', 'Company added successfully');
          setIsEmailExists(false);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            showToast('error', 'Email already exists');
            setIsEmailExists(true);
          } else {
            showToast('error', 'Adding company failed');
          }
        } else {
          showToast('error', 'An unexpected error occurred');
        }
      }
    } else {
      try {
        if (isSubscriptionChange && previousType === 'TRIAL' && fetchedCompanyDetails) {
          // Update company with subscription change and credits
          const updatePayload = {
            id: companyId,
            companyName: fetchedCompanyDetails.companyName,
            domain: fetchedCompanyDetails.domain,
            gst: fetchedCompanyDetails.gst,
            address: fetchedCompanyDetails.address,
            contactPerson: fetchedCompanyDetails.contactPerson,
            designation: fetchedCompanyDetails.designation,
            contactEmail: fetchedCompanyDetails.contactEmail,
            contactNumber: fetchedCompanyDetails.contactNumber,
            subscriptionType: 'SUBSCRIBER',
            transactionDetails: [
              {
                transactionDate: values.transactionDate,
                amount: values.amount,
                transactionId: values.transactionId,
                modeOfPayment: values.modeOfPayment,
                bankName: values.bankName,
                addCredits: values.addCredits,
              },
            ],
          };

          const response = await axios.put(
            `/api/company/updatecompany/${companyId}`,
            updatePayload,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (response.status === 200) {
            setIsSuccessOpen(true);
            form.reset();
            // showToast('success', 'Company updated and credits added successfully');
          }
        } else {
          // Just add credits
          const payload = {
            transactionDate: values.transactionDate || null,
            amount: values.amount || null,
            transactionId: values.transactionId || null,
            modeOfPayment: values.modeOfPayment || null,
            bankName: values.bankName || null,
            addCredits: values.addCredits || null,
            companyId,
          };

          const response = await axios.post('/api/credits/addcredits', payload, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.status === 200) {
            setIsSuccessOpen(true);
            form.reset();
            // showToast('success', 'Credits added successfully');
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          showToast('error', error.response?.data?.message || 'Operation failed');
        } else {
          showToast('error', 'An unexpected error occurred');
        }
      }
    }
  };

  const handleAddCredits = () => {
    setIsSuccessOpen(false);
    setIsSuccessOpen2(true);
    form.reset();
    setIsSuccessOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // useeffect to show default browser popup whn refresh without saving form
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // useeffect to show warning popup when we switch to other pages with unsaved form
  useEffect(() => {
    const originalPush = router.push;

    router.push = (...args) => {
      const [url] = args;

      // Bypass popup if intentional navigations
      if (isDirty && !isIntentionalNav.current) {
        setIsPopupOpen(true);
        setPendingNavigation(() => () => {
          dispatch(clearCompanyFormData());
          originalPush(...args);
        });
        return Promise.resolve(); // cancel navigation
      }
      // Reseting the flag for future navigations
      isIntentionalNav.current = false;
      return originalPush(...args);
    };
    return () => {
      router.push = originalPush; // Restore
    };
  }, [isDirty, router, dispatch]);

  // const handleNavigate = () => {
  //  router.push('/companies/addCompany');
  //  router.back();
  // };

  const handleNavigate = useCallback(() => {
    if (isDirty) {
      setIsPopupOpen(true);
      setPendingNavigation(() => () => {
        router.back();
      });
    } else {
      router.back();
    }
  }, [router, isDirty]);

  const handleLeave = () => {
    setIsPopupOpen(false);
    isIntentionalNav.current = true;
    pendingNavigation?.();
  };

  const handleStay = () => {
    setIsPopupOpen(false);
    setPendingNavigation(null);
  };

  const avatarFallback = useMemo(() => companyName?.charAt(0).toUpperCase() || 'C', [companyName]);

  return (
    <>
      <div className="min-h-screen bg-[#111111] text-white">
        {/* =====================================================
          PAGE HEADER
      ===================================================== */}
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8">
          <button
            type="button"
            onClick={handleNavigate}
            className="
            group
            flex
            items-center
            gap-4
            text-white
            transition-colors
            duration-200
          "
          >
            <ArrowLeft
              className="
              h-7
              w-7
              sm:h-8
              sm:w-8
              text-gray-200
              transition-transform
              duration-200
              group-hover:-translate-x-1
            "
            />

            <h2
              className="
              text-xl
              sm:text-3xl
              lg:text-4xl
              font-bold
              tracking-tight
              text-white
            "
            >
              Transaction Details
            </h2>
          </button>
        </div>

        {/* =====================================================
          TRANSACTION CARD
      ===================================================== */}
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 mt-8 pb-10">
          <div
            className="
            w-full
            overflow-hidden
            rounded-lg
            border
            border-[#3A3A4A]
            bg-[#1A192D]
          "
          >
            {/* =================================================
              COMPANY HEADER
          ================================================= */}
            <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-7">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-5"
              >
                {/* Avatar */}
                <Avatar
                  className="
                  h-14
                  w-14
                  sm:h-16
                  sm:w-16
                  rounded-lg
                  border
                  border-[#7127FF]
                  bg-[#211947]
                  shrink-0
                "
                >
                  <AvatarFallback
                    className="
                    rounded-lg
                    bg-[#211947]
                    text-white
                    text-xl
                    sm:text-2xl
                    font-semibold
                  "
                  >
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>

                {/* Company name */}
                <div className="min-w-0">
                  <h2
                    className="
                    text-xl
                    sm:text-xl
                    lg:text-[30px]
                    font-bold
                    text-white
                    truncate
                  "
                  >
                    {companyName || 'Company'}
                  </h2>
                </div>
              </motion.div>
            </div>

            {/* =================================================
              FORM
          ================================================= */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div
                  className="
                  grid
                  grid-cols-1
                  lg:grid-cols-2
                  gap-x-10
                  gap-y-8
                  px-6
                  sm:px-8
                  lg:px-10
                  pb-10
                "
                >
                  {/* =========================================
                    TRANSACTION DATE
                ========================================= */}
                  <FormField
                    control={form.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-300
                        "
                        >
                          Transaction Date
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <div
                              className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-[#29155F]
                              text-[#7C3CFF]
                              pointer-events-none
                            "
                            >
                              <CalendarDays size={17} />
                            </div>

                            <Input
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              {...field}
                              className="
                              h-[62px]
                              w-full
                              rounded-xl
                              border
                              border-[#444359]
                              bg-[#1A192D]
                              pl-[62px]
                              pr-4
                              text-base
                              text-gray-300
                              placeholder:text-gray-500
                              shadow-none
                              outline-none
                              transition-all
                              duration-200
                              focus:border-[#7C3CFF]
                              focus:ring-1
                              focus:ring-[#7C3CFF]
                              [color-scheme:dark]
                            "
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="mt-2 text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* =========================================
                    AMOUNT
                ========================================= */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-300
                        "
                        >
                          Amount
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <div
                              className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-[#29155F]
                              text-[#7C3CFF]
                              pointer-events-none
                            "
                            >
                              <IndianRupee size={17} />
                            </div>

                            <Input
                              type="text"
                              {...field}
                              value={field.value ?? ''}
                              placeholder="Enter the amount"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, '');

                                field.onChange(val === '' ? undefined : Number(val));
                              }}
                              className="
                              h-[62px]
                              w-full
                              rounded-xl
                              border
                              border-[#444359]
                              bg-[#1A192D]
                              pl-[62px]
                              pr-4
                              text-base
                              text-white
                              placeholder:text-gray-500
                              shadow-none
                              transition-all
                              duration-200
                              focus:border-[#7C3CFF]
                              focus:ring-1
                              focus:ring-[#7C3CFF]
                            "
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="mt-2 text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* =========================================
                    TRANSACTION ID
                ========================================= */}
                  <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-300
                        "
                        >
                          Transaction ID
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <div
                              className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-[#29155F]
                              text-[#7C3CFF]
                              pointer-events-none
                            "
                            >
                              <ArrowRightLeft size={17} />
                            </div>

                            <Input
                              type="text"
                              {...field}
                              placeholder="Enter Transaction ID"
                              className="
                              h-[62px]
                              w-full
                              rounded-xl
                              border
                              border-[#444359]
                              bg-[#1A192D]
                              pl-[62px]
                              pr-4
                              text-base
                              text-white
                              placeholder:text-gray-500
                              shadow-none
                              transition-all
                              duration-200
                              focus:border-[#7C3CFF]
                              focus:ring-1
                              focus:ring-[#7C3CFF]
                            "
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="mt-2 text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* =========================================
                    MODE OF PAYMENT
                ========================================= */}
                  <FormField
                    control={form.control}
                    name="modeOfPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-300
                        "
                        >
                          Mode of Payment
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <div
                              className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-[#29155F]
                              text-[#7C3CFF]
                              pointer-events-none
                            "
                            >
                              <CreditCard size={17} />
                            </div>

                            <Input
                              type="text"
                              {...field}
                              placeholder="Select Mode of Payment"
                              className="
                              h-[62px]
                              w-full
                              rounded-xl
                              border
                              border-[#444359]
                              bg-[#1A192D]
                              pl-[62px]
                              pr-4
                              text-base
                              text-white
                              placeholder:text-gray-500
                              shadow-none
                              transition-all
                              duration-200
                              focus:border-[#7C3CFF]
                              focus:ring-1
                              focus:ring-[#7C3CFF]
                            "
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="mt-2 text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* =========================================
                    BANK NAME
                ========================================= */}
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-300
                        "
                        >
                          Bank Name
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <div
                              className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-[#29155F]
                              text-[#7C3CFF]
                              pointer-events-none
                            "
                            >
                              <Landmark size={17} />
                            </div>

                            <Input
                              type="text"
                              {...field}
                              placeholder="Enter Bank name"
                              className="
                              h-[62px]
                              w-full
                              rounded-xl
                              border
                              border-[#444359]
                              bg-[#1A192D]
                              pl-[62px]
                              pr-4
                              text-base
                              text-white
                              placeholder:text-gray-500
                              shadow-none
                              transition-all
                              duration-200
                              focus:border-[#7C3CFF]
                              focus:ring-1
                              focus:ring-[#7C3CFF]
                            "
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="mt-2 text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* =========================================
                    ADD CREDITS
                ========================================= */}
                  <FormField
                    control={form.control}
                    name="addCredits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          uppercase
                          tracking-wide
                          text-gray-300
                        "
                        >
                          Add Credits
                          <span className="ml-1 text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <div
                              className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              bg-[#29155F]
                              text-[#7C3CFF]
                              pointer-events-none
                            "
                            >
                              <BriefcaseBusiness size={17} />
                            </div>

                            <Input
                              type="text"
                              {...field}
                              value={field.value ?? ''}
                              placeholder="Enter Credits"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, '');

                                field.onChange(val === '' ? undefined : Number(val));
                              }}
                              className="
                              h-[62px]
                              w-full
                              rounded-xl
                              border
                              border-[#444359]
                              bg-[#1A192D]
                              pl-[62px]
                              pr-4
                              text-base
                              text-white
                              placeholder:text-gray-500
                              shadow-none
                              transition-all
                              duration-200
                              focus:border-[#7C3CFF]
                              focus:ring-1
                              focus:ring-[#7C3CFF]
                            "
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="mt-2 text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* =================================================
                  ACTION BAR
              ================================================= */}
                <div
                  className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  sm:items-center
                  sm:justify-end
                  gap-3
                  border-t
                  border-[#343347]
                  px-6
                  sm:px-8
                  lg:px-10
                  py-6
                "
                >
                  {/* Cancel */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNavigate}
                    disabled={isSubmitting}
                    className="
                    h-[54px]
                    min-w-[110px]
                    rounded-lg
                    border
                    border-[#444359]
                    bg-transparent
                    px-6
                    text-sm
                    font-medium
                    text-gray-200
                    hover:bg-white/5
                    hover:text-white
                    hover:border-[#5A596E]
                  "
                  >
                    Cancel
                  </Button>

                  {/* Save */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                    h-[54px]
                    min-w-[165px]
                    rounded-lg
                    border-0
                    bg-gradient-to-r
                    from-[#E83DDA]
                    to-[#5D1BEF]
                    px-7
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-purple-900/20
                    transition-all
                    duration-300
                    hover:from-[#F04BE3]
                    hover:to-[#6C29FF]
                    hover:shadow-purple-900/40
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  >
                    {isSubmitting ? 'Saving...' : 'Save Transaction'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* =====================================================
        SUCCESS POPUPS
    ===================================================== */}
      <PopupMessage
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        variant="success"
        title=""
        message="Credits added Successfully"
        navigateOnClose
      />

      <PopupMessage
        isOpen={isSuccessOpen2}
        onClose={() => {
          setIsSuccessOpen2(false);
          dispatch(clearCompanyFormData());
          router.push('/companies');
        }}
        variant="success"
        title="Company added Successfully"
        message={
          addMEssage === 'add Company'
            ? 'Do you want to add another company?'
            : 'Do you want to add Credits'
        }
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setIsSuccessOpen2(false);
              dispatch(clearCompanyFormData());
              router.push('/companies');
            },
            variant: 'outline',
            className: 'sm:w-56',
          },
          {
            label: 'Add more company',
            onClick: () => {
              setIsSuccessOpen2(false);
              dispatch(clearCompanyFormData());
              router.push('/companies/addCompany');
            },
            variant: 'default',
            className: 'sm:w-56 bg-blue10 hover:bg-blue20',
          },
        ]}
      />

      <PopupMessage
        isOpen={isPopupOpen}
        onClose={handleStay}
        variant="warning"
        title="Unsaved"
        message="You have unsaved changes. If you leave this page or switch tabs, the information you entered will be lost."
        actions={[
          {
            label: 'Leave anyway',
            onClick: handleLeave,
            variant: 'outline',
          },
          {
            label: 'Stay on the page',
            onClick: handleStay,
            variant: 'default',
            className: 'bg-blue10 hover:bg-blue20',
          },
        ]}
      />
    </>
  );
}
