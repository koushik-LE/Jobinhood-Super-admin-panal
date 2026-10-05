'use client';
import DashboardLayout from '@/app/dashboard-layout';
import { PopupMessage } from '@/components/constant/popup-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DialogHeader } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showToast } from '@/components/constant/custom-toast';
// import { validateDomainExists } from '@/lib/domain-validation';

// Import from country-state-city
import { Country, State, City } from 'country-state-city';
import type { ICountry, IState, ICity } from 'country-state-city';

const formSchema = z.object({
  companyName: z
    .string()
    .min(3, {
      message: 'Company name must be at least 3 characters long.',
    })
    .max(100, {
      message: 'Company name cannot exceed 100 characters.',
    })
    .regex(/^(?!\d+$)[a-zA-Z0-9 ]+$/, {
      message: 'Company name must be alphabetic or alphanumeric.',
    }),
  contactPerson: z
    .string()
    .min(1, { message: 'Contact Name is required.' })
    .regex(/^[A-Za-z\s]+$/, {
      message: 'Contact Name must contain only letters.',
    }),

  Designation: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 2, {
      message: 'Designation must be at least 2 characters.',
    }),

  country: z.string().min(1, { message: 'Country is required.' }),

  address: z
    .string()
    .optional()
    .refine(val => !val || (val.length >= 3 && val.length <= 100), {
      message: 'Address must be between 3 and 100 characters in length.',
    }),

  contactNumber: z
    .string()
    .min(7, {
      message: 'Phone number must be between 7 and 15 digits long.',
    })
    .max(15, {
      message: 'Phone number cannot exceed 15 digits.',
    })
    .regex(/^[0-9]+$/, {
      message: 'Phone number can only contain digits.',
    }),

  gstNo: z
    .string()
    .optional()
    .refine(val => !val || /^[a-zA-Z0-9]+$/.test(val), {
      message: 'GSTIN can only contain letters and numbers.',
    }),

  state: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 2, {
      message: 'State name must be at least 2 characters long.',
    })
    .refine(val => !val || val.length <= 50, {
      message: 'State name cannot exceed 50 characters.',
    }),

  city: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 2, {
      message: 'City name must be at least 2 characters long.',
    })
    .refine(val => !val || val.length <= 50, {
      message: 'City name cannot exceed 50 characters.',
    }),

  pinCode: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;

      if (val.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 5,
          type: 'string',
          inclusive: true,
          message: 'Pin code must be at least 5 characters long.',
        });
      }

      if (val.length > 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 10,
          type: 'string',
          inclusive: true,
          message: 'Pin code cannot exceed 10 characters.',
        });
      }

      if (!/^[0-9]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Pin code can only contain digits.',
        });
      }
    }),

  companyDomain: z
    .string()
    .min(1, 'Domain is required')
    .refine(
      val => {
        const domainRegex = /^(https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,}(\.[a-z]{2,})?$/i;
        return domainRegex.test(val);
      },
      {
        message:
          'Please enter a valid domain like prakat.com, www.prakat.com, or https://prakat.com',
      }
    ),

  emailId: z.string().email({
    message: 'Please enter a valid email address (e.g., example@company.com)',
  }),

  subscriptionType: z.enum(['TRIAL', 'SUBSCRIBER']),
  credits: z.number().min(0, 'Credits cannot be negative').optional(),
});

type FormValues = z.infer<typeof formSchema>;

function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const companyId = id;
  const dispatch = useDispatch();

  // State declarations
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [previousCredits, setPreviousCredits] = useState<number>(0);
  const [previousSubscriptionType, setPreviousSubscriptionType] = useState<'TRIAL' | 'SUBSCRIBER'>(
    'TRIAL'
  );

  // Email validation states
  const [emailValidationStatus, setEmailValidationStatus] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [emailValidationMessage, setEmailValidationMessage] = useState<string>('');
  const [originalEmail, setOriginalEmail] = useState<string>('');

  // Domain validation state
  const [isDomainValidating, setIsDomainValidating] = useState(false);

  // State for country, state, city management
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [availableStates, setAvailableStates] = useState<IState[]>([]);
  const [availableCities, setAvailableCities] = useState<ICity[]>([]);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionType: 'TRIAL',
      credits: 0,
    },
  });

  const subscriptionType = watch('subscriptionType');
  const watchedDomain = watch('companyDomain');
  const emailId = watch('emailId');

  // Debounced email validation - only when email is different from original
  useEffect(() => {
    const validateEmail = async (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // adding for validation

      if (!email) {
        setEmailValidationStatus('idle');
        setEmailValidationMessage('');
        clearErrors('emailId');
        return;
      }

      // adding to show error message when we type invalid "Name"
      if (!emailRegex.test(emailId)) {
        setEmailValidationStatus('invalid');
        setEmailValidationMessage('Please enter a valid email address (e.g., example@gmail.com)');
        setError('emailId', {
          type: 'manual',
          message: 'Please enter a valid email address (e.g., example@gmail.com)',
        });
        return;
      }

      // Only validate if email is different from original
      if (email === originalEmail) {
        setEmailValidationStatus('valid');
        setEmailValidationMessage('');
        clearErrors('emailId');
        return;
      }

      setEmailValidationStatus('validating');
      // setEmailValidationMessage('Validating email...');

      try {
        const response = await fetch('/api/EmailValidation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.exists) {
          setEmailValidationStatus('invalid');
          setEmailValidationMessage(data.message || 'Email already exists');
          setError('emailId', {
            type: 'manual',
            message: data.message || 'Email already exists',
          });
        } else {
          setEmailValidationStatus('valid');
          setEmailValidationMessage(''); // Don't show any message when email is available
          clearErrors('emailId');
        }
      } catch (error) {
        console.error('Email validation error:', error);
        setEmailValidationStatus('invalid');
        setEmailValidationMessage('Failed to validate email');
        setError('emailId', {
          type: 'manual',
          message: 'Failed to validate email',
        });
      }
    };

    const timeoutId = setTimeout(() => {
      validateEmail(emailId);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [emailId, setError, clearErrors, originalEmail]);

  // Fetch company data
  const fetchCompany = useCallback(async () => {
    if (!companyId) return;

    try {
      const response = await axios.post(
        '/api/company/getcompany',
        { id: companyId },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.status === 200) {
        const resData = response.data.data;
        if (resData.subscriptionType === 'SUBSCRIBER') {
          setPreviousCredits(resData.transactionDetails[0]?.addCredits || 0);
        }
        setPreviousSubscriptionType(resData.subscriptionType || 'TRIAL');

        // Set the original email before resetting the form
        const originalEmailValue = resData.contactEmail || '';
        setOriginalEmail(originalEmailValue);

        reset({
          companyName: resData.companyName,
          contactPerson: resData?.contactPerson || '',
          Designation: resData?.designation || '',
          contactNumber: resData?.contactNumber || '',
          address: resData.address?.addressLine || '',
          pinCode: resData.address?.pinCode || '',
          gstNo: resData.gst || '',
          companyDomain: resData.domain || '',
          emailId: originalEmailValue,
          subscriptionType: resData.subscriptionType || 'TRIAL',
          credits: resData.transactionDetails[0]?.addCredits || 0,
        });
        const countryCode = resData.address?.country;
        const stateCode = resData.address?.state;
        const cityName = resData.address?.city;
        setTimeout(() => {
          if (countryCode) {
            const country = Country.getCountryByCode(countryCode);
            if (country) {
              setSelectedCountry(country);
              setValue('country', countryCode);
              const states = State.getStatesOfCountry(countryCode);
              setAvailableStates(states);
              setTimeout(() => {
                if (stateCode) {
                  const state = State.getStateByCodeAndCountry(stateCode, countryCode);
                  if (state) {
                    setSelectedState(state);
                    setValue('state', stateCode);

                    // Set available cities
                    const cities = City.getCitiesOfState(countryCode, stateCode);
                    setAvailableCities(cities);

                    setTimeout(() => {
                      if (cityName) {
                        setValue('city', cityName);
                      }
                    }, 100);
                  }
                }
              }, 100);
            }
          }
        }, 100);
      }
    } catch {
      showToast('error', 'Failed to fetch company details');
    }
  }, [companyId, reset, setValue]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  // Transform form values
  const transformValues = useCallback(
    (values: FormValues) => {
      const baseData = {
        companyName: values.companyName,
        domain: values.companyDomain,
        gst: values.gstNo,
        address: {
          addressLine: values.address,
          country: values.country,
          state: values.state,
          city: values.city,
          pinCode: values.pinCode,
        },
        contactPerson: values.contactPerson,
        designation: values.Designation,
        contactEmail: values.emailId,
        contactNumber: values.contactNumber,
        subscriptionType: values.subscriptionType,
      };

      if (values.subscriptionType === 'SUBSCRIBER') {
        return {
          ...baseData,
          addCredits: values.credits || 0,
          transactionDetails: [
            {
              addCredits: values.credits || 0,
              previousCredits,
            },
          ],
        };
      }

      return {
        ...baseData,
        addCredits: values.credits || 0,
        transactionDetails: [
          {
            addCredits: values.credits || 0,
          },
        ],
      };
    },
    [previousCredits]
  );

  // Form submission
  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (emailValidationStatus !== 'valid') {
        showToast('error', 'Please ensure email is valid before submitting');
        return;
      }

      const transformedData = transformValues(values);

      try {
        const response = await axios.put(
          `/api/company/updatecompany/${id}`,
          { ...transformedData, id: companyId },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.status === 200) {
          setIsSuccessOpen(true);
          // showToast('success', 'Company updated successfully');
        } else {
          setIsSuccessOpen(false);
          showToast('error', response.data.message || 'Update failed');
        }
      } catch (error) {
        console.error('Submission error:', error);
        showToast('error', 'Failed to update company. Please try again.');
      }
    },
    [companyId, transformValues, id, emailValidationStatus]
  );

  // Navigation
  const handleNext = useCallback(async () => {
    const values = getValues();

    if (emailValidationStatus !== 'valid') {
      showToast('error', 'Please ensure email is valid before proceeding');
      return;
    }

    router.push(
      `/credits/addCredits?companyId=${companyId}&companyName=${values.companyName}&isSubscriptionChange=true&previousType=${previousSubscriptionType}`
    );
  }, [getValues, companyId, router, previousSubscriptionType, emailValidationStatus]);

  const handleNavigate = useCallback(() => {
    window.history.back();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (watchedDomain.length > 3) {
        setIsDomainValidating(true);
        try {
          // const domainRegex = /^[\w.-]+\.[a-z]{2,}$/i;
          // if (domainRegex.test(watchedDomain)) {
          const cleanDomain = watchedDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
          const res = await axios.post(`/api/validate-domain`, { domain: cleanDomain });
          if (res.status !== 200) {
            throw new Error('Network response was not ok');
          }
          console.log(res);
          const data = await res.data;
          setError('companyDomain', {});

          if (!data.isValid) {
            setError('companyDomain', {
              type: 'manual',
              message: 'Domain does not exist or is not accessible',
            });
          }
          // }
        } catch (err) {
          console.log('Domain validation error:', err);
          if (axios.isAxiosError(err) && err.response?.data?.error) {
            console.log(err);
            setError('companyDomain', {
              type: 'manual',
              message: err.response.data.error,
            });
          } else {
            setError('companyDomain', {
              type: 'manual',
              message: 'Something went wrong while validating domain',
            });
          }
        } finally {
          setIsDomainValidating(false);
        }
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [watchedDomain, setError]);

  // Fetch all countries on component mount
  useEffect(() => {
    setAllCountries(Country.getAllCountries());
  }, []);
  useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry.isoCode);
      setAvailableStates(states);

      // Don't reset state and city if we're loading initial data
      // Only reset when user manually changes country
      const currentCountry = watch('country');
      if (currentCountry && currentCountry !== selectedCountry.isoCode) {
        setValue('state', '');
        setSelectedState(null);
        setValue('city', '');
        setAvailableCities([]);
      }
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [selectedCountry, setValue, watch]);

  // Update the useEffect for setting available cities
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const cities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
      setAvailableCities(cities);

      // Don't reset city if we're loading initial data
      // Only reset when user manually changes state
      const currentState = watch('state');
      if (currentState && currentState !== selectedState.isoCode) {
        setValue('city', '');
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry, selectedState, setValue, watch]);

  // UI helpers
  const showNextButton = useCallback(() => {
    const currentSubscriptionType = watch('subscriptionType');
    return previousSubscriptionType === 'TRIAL' && currentSubscriptionType === 'SUBSCRIBER';
  }, [watch, previousSubscriptionType]);

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: 'easeOut',
        },
      },
    }),
    []
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <ArrowLeft style={{ cursor: 'pointer' }} onClick={handleNavigate} className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Edit Company</h2>
          </div>
        </div>

        <motion.div
          className="max-w-xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card>
            <CardContent className="pt-6 dark:bg-gray-800">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-blue10 dark:text-indigo-400">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Enter Company Name"
                    {...register('companyName')}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-blue10 dark:text-indigo-400">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="Enter contact person"
                    {...register('contactPerson')}
                  />
                  {errors.contactPerson && (
                    <p className="text-red-500 text-sm">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Designation" className="text-blue10 dark:text-indigo-400">
                    Designation
                  </Label>
                  <Input
                    id="Designation"
                    placeholder="Enter Designation"
                    {...register('Designation')}
                  />
                  {errors.Designation && (
                    <p className="text-red-500 text-sm">{errors.Designation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-blue10 dark:text-indigo-400">
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    placeholder="Enter Contact Number"
                    {...register('contactNumber')}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-blue10 dark:text-indigo-400">
                    Enter address
                  </Label>
                  <Input id="address" placeholder="Enter address" {...register('address')} />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address.message}</p>
                  )}
                </div>
                {/* Country Select using shadcn/ui */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-blue10 dark:text-indigo-400">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={value => {
                          field.onChange(value);
                          setSelectedCountry(Country.getCountryByCode(value) || null);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCountries.map(country => (
                            <SelectItem key={country.isoCode} value={country.isoCode}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm">{errors.country.message}</p>
                  )}
                </div>

                {/* State Select using shadcn/ui */}
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-blue10 dark:text-indigo-400">
                    State
                  </Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={value => {
                          field.onChange(value);
                          setSelectedState(
                            State.getStateByCodeAndCountry(value, selectedCountry?.isoCode || '') ||
                              null
                          );
                        }}
                        value={field.value}
                        disabled={!selectedCountry} // Disable if no country selected
                      >
                        <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStates.length > 0 &&
                            availableStates.map(state => (
                              <SelectItem key={state.isoCode} value={state.isoCode}>
                                {state.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                </div>

                {/* City Select using shadcn/ui */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-blue10 dark:text-indigo-400">
                    City
                  </Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedState} // Disable if no state selected
                      >
                        <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.length > 0 &&
                            availableCities.map(city => (
                              <SelectItem key={city.name} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode" className="text-blue10 dark:text-indigo-400">
                    Pin code / zip code
                  </Label>
                  <Input id="pinCode" placeholder="Enter Pin code" {...register('pinCode')} />
                  {errors.pinCode && (
                    <p className="text-red-500 text-sm">{errors.pinCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNo" className="text-blue10 dark:text-indigo-400">
                    GST No
                  </Label>
                  <Input id="gstNo" placeholder="Enter GST No" {...register('gstNo')} />
                  {errors.gstNo && <p className="text-red-500 text-sm">{errors.gstNo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDomain">
                    Company Domain <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyDomain"
                      placeholder="Enter Company domain (e.g., example.com)"
                      {...register('companyDomain')}
                    />
                    {isDomainValidating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                  {errors.companyDomain && (
                    <p className="text-red-500 text-sm">{errors.companyDomain.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailId" className="text-blue10 dark:text-indigo-400">
                    Email Id <span className="text-red-500">*</span>
                  </Label>
                  <Input id="emailId" placeholder="Enter Email Id" {...register('emailId')} />
                  {emailValidationStatus === 'invalid' && (
                    <p className="text-red-500 text-sm">{emailValidationMessage}</p>
                  )}
                  {errors.emailId && emailValidationStatus === 'idle' && (
                    <p className="text-red-500 text-sm">{errors.emailId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionType" className="text-blue10 dark:text-indigo-400">
                    Subscription Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="subscriptionType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={previousSubscriptionType === 'SUBSCRIBER'}
                      >
                        <SelectTrigger
                          className={
                            previousSubscriptionType === 'SUBSCRIBER'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select subscription type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRIAL">TRIAL</SelectItem>
                          <SelectItem value="SUBSCRIBER">SUBSCRIBER</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.subscriptionType && (
                    <p className="text-red-500 text-sm">{errors.subscriptionType.message}</p>
                  )}
                </div>

                {/* {subscriptionType === 'TRIAL' && (
                  <div className="space-y-2">
                    <Label htmlFor="credits" className="text-gray10 dark:text-indigo-400">
                      Add Credits
                    </Label>
                    <Input
                      id="credits"
                      type="text"
                      placeholder="Enter Credits"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      disabled
                      {...register('credits')}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        // If empty, set undefined, else set as number
                        setValue('credits', val === '' ? undefined : Number(val));
                      }}
                    />
                    {errors.credits && (
                      <p className="text-red-500 text-sm">{errors.credits.message}</p>
                    )}
                  </div>
                )} */}

                {showNextButton() ? (
                  <Button
                    type="button"
                    className="w-full bg-blue10 dark:bg-blue-600 text-white hover:bg-blue10/90 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || emailValidationStatus !== 'valid'}
                    onClick={handleNext}
                  >
                    {isSubmitting ? 'Next...' : 'Next'}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-blue10 dark:bg-blue-600 text-white hover:bg-blue10/90 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || emailValidationStatus !== 'valid'}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <PopupMessage
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          variant="success"
          title=""
          message="Company Updated Successfully"
          navigateOnClose // using to router back using close button
          // actions={[
          //   {
          //     label: 'Done',
          //     onClick: () => {
          //       setIsSuccessOpen(false);
          //       router.push('/companies');
          //     },
          //     variant: 'default',
          //     className: 'bg-blue10 hover:bg-blue20',
          //   },
          // ]}
        />
      </div>
    </DashboardLayout>
  );
}

export default Page;
