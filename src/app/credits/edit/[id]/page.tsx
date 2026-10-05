'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type CompanyData from '@/components/Models/creditEdit-companyData';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { showToast } from '@/components/constant/custom-toast';
import { PopupMessage } from '@/components/constant/popup-message';
import { lazy, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';

const DashboardLayout = lazy(() => import('@/app/dashboard-layout'));

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
    .preprocess(
      val => {
        if (val === '') return undefined;
        return val;
      },
      z
        .number({ invalid_type_error: 'Amount must be a valid number' })
        .positive('Amount must be greater than zero')
    )
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

export default function Page() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id;
  const creditId = id;
  const companyName = searchParams.get('companyName');
  const router = useRouter();

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

  useEffect(() => {
    if (!creditId) return; // Prevent fetching if companyId is not available

    const fetchCredit = async () => {
      try {
        const response = await axios.post(
          '/api/credits/getCredits',
          { id },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response.status === 200) {
          setCompany(response.data);
          const resData = response.data;

          form.reset({
            transactionDate: resData.data.transactionDate || new Date().toISOString().split('T')[0],
            amount: resData.data.amount || undefined,
            transactionId: resData.data.transactionId || '',
            modeOfPayment: resData.data.modeOfPayment || '',
            bankName: resData.data.bankName || '',
            addCredits: resData.data.addCredits || '',
          });
        }
      } catch {
        showToast('error', 'Failed to fetch company details');
      }
    };

    fetchCredit();
  }, [creditId, id, form]);

  // Handle form submission
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const payload = {
        transactionDate: values.transactionDate || null,
        amount: values.amount || null,
        transactionId: values.transactionId || null,
        modeOfPayment: values.modeOfPayment || null,
        bankName: values.bankName || null,
        addCredits: values.addCredits || null,
        id,
      };
      try {
        const response = await axios.post('/api/credits/updateCredit', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response) {
          setIsSuccessOpen(true);
          form.reset();
          // showToast('success', 'credits added sucessfully');
        } else {
          const errorData = await response;
          showToast('error', 'credits failed');
        }
      } catch {
        showToast('error', 'adding credits failed');
      }
    },
    [form, id]
  );

  const handleAddCredits = useCallback(() => {
    setIsSuccessOpen(false);
    form.reset();
    setIsSuccessOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [form]);

  const handleNavigate = () => {
    router.push('/companies/addCompany');
    router.back();
  };

  return (
    <>
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <DashboardLayout>
          <div className="container mx-auto p-2 mb-6">
            <div className="flex items-center text-black30 space-x-2">
              <ArrowLeft
                style={{
                  cursor: 'pointer',
                }}
                onClick={handleNavigate}
                className="h-8 w-8"
              />
              <h2 className="text-lg sm:text-3xl text-blue130 font-bold">
                Edit Transaction Details
              </h2>
            </div>
          </div>
          <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-2"
            >
              <Avatar
                className="flex items-center justify-center rounded-full w-12 h-12 text-lg font-bold
      bg-gradient-to-br from-blue-500 to-indigo-600 text-black shadow-md
      dark:from-gray-700 dark:to-gray-900 dark:text-gray-200
      transition-all duration-300"
              >
                <AvatarFallback>{company?.data.companyName?.charAt(0) || 'C'}</AvatarFallback>
              </Avatar>

              <div className="text-base font-bold text-gray-900 dark:text-white font-poppins">
                {company?.data.companyName || 'Company'}
              </div>
            </motion.div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue10 dark:text-indigo-400">
                        Transaction Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Choose Date"
                          max={new Date().toISOString().split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue10 dark:text-indigo-400">Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Enter Amount."
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(val === '' ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue10 dark:text-indigo-400">
                        Transaction ID
                      </FormLabel>
                      <FormControl>
                        <Input type="text" {...field} placeholder="Enter Transaction Id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modeOfPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue10 dark:text-indigo-400">
                        Mode of Payment
                      </FormLabel>
                      <FormControl>
                        <Input type="text" {...field} placeholder="Enter mode of Payment" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue10 dark:text-indigo-400">Bank Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} placeholder="Enter Bank Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue10 dark:text-indigo-400">
                        Add Credits <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Enter credits"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(val === '' ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue10 dark:bg-blue-600 text-white hover:bg-blue10/90 dark:hover:bg-blue-500"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </Form>
            <PopupMessage
              isOpen={isSuccessOpen}
              onClose={() => setIsSuccessOpen(false)}
              variant="success"
              title=""
              message="Credits Updated Successfully"
              navigateOnClose // using to router back using close button
              // actions={[
              //   {
              //     label: 'Done',
              //     onClick: () => {
              //       setIsSuccessOpen(false);
              //       router.back();
              //     },
              //     variant: 'outline',
              //   },
              // ]}
            />
          </div>
        </DashboardLayout>
      </Suspense>
    </>
  );
}
