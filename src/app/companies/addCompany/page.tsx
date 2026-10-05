'use client';
import type React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  UserRound,
  BriefcaseBusiness,
  Phone,
  Mail,
  MapPin,
  Globe2,
  Hash,
  Camera,
  Plus,
  FileSpreadsheet,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select, // This is your shadcn/ui Select
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/app/dashboard-layout';
import excelIcon from '@/assets/excelIcon.svg';
import Image from 'next/image';
import { PopupMessage } from '@/components/constant/popup-message';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCompanyDatils, setLogoData } from '@/redux/constSlice';
import { showToast } from '@/components/constant/custom-toast';
import type CompanyFormData from '@/components/Models/addCompany-CompanyFormData';
import type { RootState } from '@/redux/store';

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
      message: 'Contact Name must contain only letters .',
    }),
  Designation: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 2, {
      message: 'Designation must be at least 2 characters.',
    }),
  address: z
    .string()
    .optional()
    .refine(val => !val || (val.length >= 3 && val.length <= 100), {
      message: 'Address must be between 3 and 100 characters in length.',
    }),
  // Schema for country, state, city now expects string values (ISO codes or names)
  country: z.string().min(1, { message: 'Country is required.' }),
  contactNumber: z.coerce
    .string()
    .min(7, {
      message: 'Phone number must be between 7 to 15 digits long.',
    })
    .max(15, {
      message: 'Phone number cannot exceed 15 digits.',
    })
    .regex(/^[0-9]+$/, {
      message: 'Phone number can only contain digits.',
    }),
  gstNo: z
    .preprocess(val => (val !== null ? String(val) : undefined), z.string())
    .optional()
    .refine(val => !val || /^[a-zA-Z0-9]+$/.test(val), {
      message: 'GSTIN can only contain letters and numbers.',
    }),
  state: z.string().optional(), // Now optional as it's selected
  city: z.string().optional(), // Now optional as it's selected
  pinCode: z
    .preprocess(val => (val !== null ? String(val) : undefined), z.string())
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return; // skip validation if empty
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
  subscriptionType: z.enum(['TRIAL', 'SUBSCRIBER'], {
    message: 'Please select a subscription type.',
  }),
  credits: z
    .string()
    .regex(/^\d+$/, {
      message: 'Credits must be a positive integer.',
    })
    .transform(Number)
    .refine(val => val > 0, {
      message: 'Credits must be greater than zero.',
    }),
});

type FormValues = {
  country: string;
  state: string;
  city: string;
};

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FieldWrapper = ({ label, required = false, error, children }: FieldWrapperProps) => (
  <div className="space-y-2">
    <label className="block text-[11px] font-semibold uppercase tracking-wide text-white/75">
      {label}
      {required && <span className="ml-1 text-[#FF3BCE]">*</span>}
    </label>

    {children}

    {error && <p className="text-xs font-medium text-red-400">{error}</p>}
  </div>
);

const InputIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-[#30136B] text-[#7C3CFF]">
    {children}
  </div>
);

export default function AddCompanyForm() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
  // New state for upload error pop-up
  const [isUploadErrorOpen, setIsUploadErrorOpen] = useState<boolean>(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string>('');

  const [addMEssage, setAddMessage] = useState<string>('');
  const dispatch = useDispatch();
  const companyDetails = useSelector((state: RootState) => state.constantReducer.companyDeatils);
  const [isDomainValidating, setIsDomainValidating] = useState(false);

  // State for country, state, city management
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [availableStates, setAvailableStates] = useState<IState[]>([]);
  const [availableCities, setAvailableCities] = useState<ICity[]>([]);

  const [uploadData, setUploadData] = useState<FormValues | null>(null); // for country state city while uploading

  // using for unsaved warning popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);
  const isIntentionalNav = useRef(false);

  // Add this selector to get persisted form data
  const persistedFormData = useSelector((state: RootState) => state.constantReducer.formData);

  // Email validation states
  const [emailValidationStatus, setEmailValidationStatus] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [emailValidationMessage, setEmailValidationMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    getValues,
    trigger,
    setError,
    clearErrors,
    setValue, // Added setValue to programmatically set form values
    formState: { errors, isSubmitting, isDirty },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: persistedFormData || {
      subscriptionType: undefined,
      country: '',
      state: '',
      city: '',
    },
  });

  const watchedDomain = watch('companyDomain');
  //const subscriptionType = watch('subscriptionType');

  // We are storing ISO codes for Country and State, and name for City.
  // When transforming, we might want to store names if required by backend,
  // or pass ISO codes. For now, let's keep it as the value from the select.
  const setCompanyFormData = useMemo(
    () => (data: CompanyFormData) => ({
      type: 'constant/setCompanyFormData',
      payload: data,
    }),
    []
  );

  console.log(errors);

  const clearCompanyFormData = useMemo(
    () => () => ({
      type: 'constant/clearCompanyFormData',
    }),
    []
  );

  const subscriptionType = watch('subscriptionType');
  const emailId = watch('emailId');

  // Debounced email validation
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
      if (!emailRegex.test(email)) {
        setEmailValidationStatus('invalid');
        setEmailValidationMessage('Please enter a valid email address (e.g., example@gmail.com)');
        setError('emailId', {
          type: 'manual',
          message: 'Please enter a valid email address (e.g., example@gmail.com)',
        });
        return;
      }

      setEmailValidationStatus('validating');
      //setEmailValidationMessage('Validating email...');

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
  }, [emailId, setError, clearErrors]);

  // Memoize the transform function
  const transformValues = useCallback(
    (values: z.infer<typeof formSchema>) => ({
      companyName: values.companyName,
      domain: values.companyDomain,
      gst: values.gstNo,
      address: {
        addressLine: values.address,
        country: values.country, // This will be the ISO code
        state: values.state, // This will be the ISO code
        city: values.city, // This will be the city name
        pinCode: values.pinCode,
      },
      contactPerson: values.contactPerson,
      designation: values.Designation,
      contactNumber: values.contactNumber.toString(),
      contactEmail: values.emailId,
      subscriptionType: values.subscriptionType,
      transactionDetails: [
        {
          addCredits: values.credits,
        },
      ],
    }),
    []
  );

  const handleNext = useCallback(async () => {
    const isValid = await trigger([
      'companyName',
      'contactPerson',
      'Designation',
      'address',
      'country',
      'contactNumber',
      'gstNo',
      'state',
      'city',
      'pinCode',
      'companyDomain',
      'emailId',
      'subscriptionType',
    ]);
    if (!isValid || emailValidationStatus !== 'valid') return;

    isIntentionalNav.current = true; // Adding this to aviod showing unsave popup for save and next btns
    const values = getValues();
    const transformedData = transformValues(values);

    dispatch(setCompanyFormData(values));

    dispatch(
      setCompanyDatils({
        ...transformedData,
        subscriptionType: 'SUBSCRIBER',
        companyId: '',
      })
    );
    router.push(`/credits/addCredits?companyName=${encodeURIComponent(values.companyName)}`);
  }, [
    dispatch,
    getValues,
    router,
    transformValues,
    trigger,
    setCompanyFormData,
    emailValidationStatus,
  ]);

  const [showBackToCompany, setShowBackToCompany] = useState(false);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      isIntentionalNav.current = true; // Adding this to aviod showing unsave popup for save and next btns
      if (emailValidationStatus !== 'valid') {
        showToast('error', 'Please ensure email is valid before submitting');
        return;
      }

      const transformedData = transformValues(values);

      try {
        const response = await fetch('/api/company/addcompany', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformedData),
        });
        const data = await response.json();
        if (response.ok) {
          dispatch(clearCompanyFormData());
          setIsSuccessOpen(true);
          setAddMessage('add Company');
          setShowBackToCompany(false);
        } else {
          if (data.message === 'Email already exists') {
            setError('emailId', {
              type: 'manual',
              message: 'Email already exists',
            });
            setShowBackToCompany(true);
          } else {
            showToast('error', 'Email already exist.');
          }
          setIsSuccessOpen(false);
        }
      } catch (error) {
        console.error('Submission error:', error);
        showToast('error', 'Network error or server issue. Please try again.');
      }
    },
    [dispatch, setError, transformValues, clearCompanyFormData, emailValidationStatus]
  );

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
  }, [isDirty, router, dispatch, clearCompanyFormData]);

  const handleDownloadExcel = useCallback(async () => {
    try {
      const response = await axios.get('/api/company/download-Excel', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample-file.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading file. Please try again.');
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      const fileName = selectedFile.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        showToast(
          'error',
          'Only .xlsx or .xls files are allowed. Please select a valid Excel file.'
        );
        event.target.value = '';
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (file) {
      setFile(null);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/company/upload-excel', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          setUploadErrorMessage(errorData.error || 'Failed to process file'); // Set error message and open the new pop-up
          setIsUploadErrorOpen(true);
          setOpen(false); // Close the upload dialog
          return; // Stop execution here
        }

        const { data } = await response.json();
        setUploadData(data);
        reset(data); // After reset, try to set selected country/state from uploaded data

        if (data.country) {
          const country = Country.getAllCountries().find(
            // c => c.isoCode === data.country || c.name === data.country
            c =>
              c.isoCode.toLowerCase() === data.country.toLowerCase() ||
              c.name.toLowerCase() === data.country.toLowerCase()
          );

          if (country) {
            setSelectedCountry(country);
            setValue('country', country.isoCode); // add to show value according to Isocode

            if (data.state) {
              const state = State.getStatesOfCountry(country.isoCode).find(
                s =>
                  s.isoCode.toLowerCase() === data.state.toLowerCase() ||
                  s.name.toLowerCase() === data.state.toLowerCase()
              );

              if (state) {
                setSelectedState(state);
                setValue('state', state.isoCode); // add to show value according to Isocode
              }
            }
          }
        }

        setFile(null);
        setOpen(false);
        showToast(
          'success',
          'File uploaded successfully',
          'The form has been populated with the file data'
        );
      } catch (error) {
        // This catch block will handle network errors or other unexpected errors
        setUploadErrorMessage(
          error instanceof Error ? error.message : 'An unknown error occurred during upload.'
        );
        setIsUploadErrorOpen(true);
        setOpen(false); // Close the upload dialog
      }
    } else {
      setUploadErrorMessage('No file selected. Please select a file to upload.');
      setIsUploadErrorOpen(true);
      setOpen(false); // Close the upload dialog if no file is selected
    }
  }, [file, reset, setValue]);

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

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (watchedDomain.length > 3) {
        setIsDomainValidating(true);
        try {
          const cleanDomain = watchedDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
          const res = await axios.post(`/api/validate-domain`, { domain: cleanDomain });
          const data = res.data;
          setError('companyDomain', {});
          console.log(data);
          if (!data.isValid) {
            console.log(data);

            setError('companyDomain', {
              type: 'manual',
              message: data.error || 'Domain does not exist or is not accessible',
            });
          } else {
            clearErrors('companyDomain');
          }
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
  }, [watchedDomain, setError, clearErrors]);

  const handleAddCompany = useCallback(
    (label: string) => {
      dispatch(clearCompanyFormData());
      reset();
      // Reset country/state selections as well
      setSelectedCountry(null);
      setSelectedState(null);
      setAvailableStates([]);
      setAvailableCities([]);

      if (label === 'add Company') {
        dispatch(clearCompanyFormData());
        router.push('/companies/addCompany');
        return;
      }
      setIsSuccessOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (label === 'add Credits') {
        router.push(
          `/credits/addCredits?companyId=${companyDetails.companyId}&companyName=${companyDetails.companyName}`
        );
      }
    },
    [
      companyDetails?.companyId,
      companyDetails?.companyName,
      dispatch,
      reset,
      router,
      clearCompanyFormData,
    ]
  );

  // const handleNavigate = useCallback(() => {
  //   dispatch(clearCompanyFormData());
  //   router.push('/companies');
  // }, [dispatch, router, clearCompanyFormData]);

  const handleNavigate = useCallback(() => {
    if (isDirty) {
      setIsPopupOpen(true);
      setPendingNavigation(() => () => {
        dispatch(clearCompanyFormData());
        router.push('/companies');
      });
    } else {
      dispatch(clearCompanyFormData());
      router.push('/companies');
    }
  }, [dispatch, router, clearCompanyFormData, isDirty]);

  // Useeffect for unsaved popup
  const handleLeave = () => {
    setIsPopupOpen(false);
    isIntentionalNav.current = true;
    pendingNavigation?.();
  };

  const handleStay = () => {
    setIsPopupOpen(false);
    setPendingNavigation(null);
  };

  // Fetch all countries on component mount
  useEffect(() => {
    setAllCountries(Country.getAllCountries());
  }, []);

  // Reset state and city in form and local state when country changes
  useEffect(() => {
    if (selectedCountry) {
      setAvailableStates(State.getStatesOfCountry(selectedCountry.isoCode));

      const currentCountry = getValues('country');
      if (selectedCountry.isoCode !== currentCountry) {
        setValue('state', '');
        setSelectedState(null);
        setValue('city', '');
        setAvailableCities([]);
      }
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [selectedCountry, getValues, setValue]);

  // Update cities when selected state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      setAvailableCities(City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode));

      const currentState = getValues('state');
      if (selectedState.isoCode !== currentState) {
        setValue('city', '');
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry, selectedState, getValues, setValue]);

  // Set default values from persisted form data on component mount
  useEffect(() => {
    if (persistedFormData) {
      reset(persistedFormData);

      // Restore selected country/state for dropdowns
      const countryCode = persistedFormData.country;
      const stateCode = persistedFormData.state;

      const foundCountry = allCountries.find(
        c => c.isoCode === countryCode || c.name === countryCode
      );
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        const foundState = State.getStatesOfCountry(foundCountry.isoCode).find(
          s => s.isoCode === stateCode || s.name === stateCode
        );
        if (foundState) {
          setSelectedState(foundState);
        }
      }
    }
  }, [persistedFormData, reset, allCountries]); // Add allCountries to dependency array

  // adding useEffect to show the Country state and city when we upload excel sheet
  useEffect(() => {
    if (selectedCountry && uploadData?.state) {
      const state = State.getStatesOfCountry(selectedCountry.isoCode).find(
        s =>
          s.isoCode.toLowerCase() === uploadData.state.toLowerCase() ||
          s.name.toLowerCase() === uploadData.state.toLowerCase()
      );

      if (state) {
        setSelectedState(state);
        setValue('state', state.isoCode);

        // Setting city immediately after state is found
        if (uploadData.city) {
          const city = City.getCitiesOfState(selectedCountry.isoCode, state.isoCode).find(
            c => c.name.toLowerCase() === uploadData.city.toLowerCase()
          );

          if (city) {
            setValue('city', city.name);
          }
        }
      }
    }
  }, [selectedCountry, uploadData, setValue]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-2">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNavigate}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/5"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Add Company
            </h1>
          </div>

          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="
      h-10
      w-fit
      rounded-lg
      border-0
      bg-gradient-to-r
      from-[#FF27D6]
      to-[#6419F5]
      px-4
      text-sm
      font-semibold
      text-white
      shadow-lg
      shadow-purple-900/20
      hover:from-[#FF3BDB]
      hover:to-[#7028FF]
    "
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Upload from Excel
          </Button>

          {/* Existing Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md border-[#3A3A4A] bg-[#191827] p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">
                  Upload Excel File
                </DialogTitle>
              </DialogHeader>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-white/75">Upload Excel file</p>

                  <div className="rounded-xl border border-dashed border-[#55556A] bg-[#1B1A2D] p-5">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#30136B]">
                        <FileSpreadsheet className="h-6 w-6 text-[#7C3CFF]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">Select your Excel file</p>

                        <p className="mt-1 text-xs text-white/40">.xlsx or .xls files only</p>
                      </div>

                      <label
                        htmlFor="excelFile"
                        className="
                  mt-2
                  cursor-pointer
                  rounded-lg
                  bg-gradient-to-r
                  from-[#FF27D6]
                  to-[#6419F5]
                  px-5
                  py-2
                  text-sm
                  font-medium
                  text-white
                "
                      >
                        Choose File
                      </label>

                      <input
                        id="excelFile"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {file && (
                    <p className="mt-3 truncate text-xs text-white/60">Selected: {file.name}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 text-sm text-[#A98CFF] transition-colors hover:text-white"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Sample File
                </button>

                <Button
                  type="button"
                  onClick={handleUpload}
                  className="
            h-11
            w-full
            rounded-lg
            bg-gradient-to-r
            from-[#FF27D6]
            to-[#6419F5]
            font-semibold
            text-white
            hover:from-[#FF3BDB]
            hover:to-[#7028FF]
          "
                >
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <motion.div
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="w-full overflow-hidden rounded-xl border border-[#3A3A4A] bg-[#191827] shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* =========================
            FORM BODY
        ========================== */}
                <div className="space-y-7 p-6 sm:p-8 lg:p-10">
                  {/* =========================
              COMPANY LOGO
          ========================== */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-white/75">
                      Company Logo
                    </label>

                    <div className="flex min-h-[104px] w-full items-center justify-center rounded-xl border border-[#3A3A4A] bg-[#1B1A2D]">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#7C2CFF] bg-[#21153D]">
                          <Camera className="h-6 w-6 text-white" />

                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6C2CFF]">
                            <Plus className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            Upload the Logo of the Company
                          </p>

                          <p className="mt-1 text-[10px] text-white/45">PNG, JPG UPTO 20MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =========================
              COMPANY NAME
          ========================== */}
                  <FieldWrapper label="Company Name" required error={errors.companyName?.message}>
                    <div className="relative">
                      <InputIcon>
                        <Building2 className="h-4 w-4" />
                      </InputIcon>

                      <Input
                        id="companyName"
                        placeholder="Company Name"
                        {...register('companyName')}
                        className="
                  h-12
                  rounded-lg
                  border-[#3A3A4A]
                  bg-[#191827]
                  pl-12
                  text-sm
                  text-white
                  placeholder:text-white/40
                  focus:border-[#7C2CFF]
                  focus:ring-1
                  focus:ring-[#7C2CFF]/30
                "
                      />
                    </div>
                  </FieldWrapper>

                  {/* =========================
              CONTACT + DESIGNATION
          ========================== */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <FieldWrapper
                      label="Contact Person"
                      required
                      error={errors.contactPerson?.message}
                    >
                      <div className="relative">
                        <InputIcon>
                          <UserRound className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="contactPerson"
                          placeholder="Contact Person"
                          {...register('contactPerson')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />
                      </div>
                    </FieldWrapper>

                    <FieldWrapper label="Designation" error={errors.Designation?.message}>
                      <div className="relative">
                        <InputIcon>
                          <BriefcaseBusiness className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="Designation"
                          placeholder="Designation"
                          {...register('Designation')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />
                      </div>
                    </FieldWrapper>
                  </div>

                  {/* =========================
              PHONE + EMAIL
          ========================== */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <FieldWrapper
                      label="Contact Number"
                      required
                      error={errors.contactNumber?.message}
                    >
                      <div className="relative">
                        <InputIcon>
                          <Phone className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="contactNumber"
                          placeholder="Contact Number"
                          inputMode="numeric"
                          {...register('contactNumber')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />
                      </div>
                    </FieldWrapper>

                    <FieldWrapper
                      label="Email Address"
                      required
                      error={
                        emailValidationStatus === 'invalid'
                          ? emailValidationMessage
                          : errors.emailId?.message
                      }
                    >
                      <div className="relative">
                        <InputIcon>
                          <Mail className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="emailId"
                          type="email"
                          placeholder="Email Address"
                          {...register('emailId')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    pr-10
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />

                        {emailValidationStatus === 'validating' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7C2CFF] border-t-transparent" />
                          </div>
                        )}

                        {emailValidationStatus === 'valid' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                            ✓
                          </div>
                        )}
                      </div>
                    </FieldWrapper>
                  </div>

                  {/* =========================
              ADDRESS
          ========================== */}
                  <FieldWrapper label="Company Address" error={errors.address?.message}>
                    <div className="relative">
                      <InputIcon>
                        <MapPin className="h-4 w-4" />
                      </InputIcon>

                      <Input
                        id="address"
                        placeholder="Company Address"
                        {...register('address')}
                        className="
                  h-12
                  rounded-lg
                  border-[#3A3A4A]
                  bg-[#191827]
                  pl-12
                  text-sm
                  text-white
                  placeholder:text-white/40
                  focus:border-[#7C2CFF]
                  focus:ring-1
                  focus:ring-[#7C2CFF]/30
                "
                      />
                    </div>
                  </FieldWrapper>

                  {/* =========================
              LOCATION
          ========================== */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {/* CITY */}
                    <FieldWrapper label="City" error={errors.city?.message}>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedState}
                          >
                            <SelectTrigger
                              className="
                        h-12
                        rounded-lg
                        border-[#3A3A4A]
                        bg-[#191827]
                        text-sm
                        text-white
                        focus:border-[#7C2CFF]
                      "
                            >
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>

                            <SelectContent className="border-[#3A3A4A] bg-[#191827] text-white">
                              {availableCities.map(city => (
                                <SelectItem key={city.name} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldWrapper>

                    {/* STATE */}
                    <FieldWrapper label="State" error={errors.state?.message}>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={value => {
                              field.onChange(value);

                              setSelectedState(
                                State.getStateByCodeAndCountry(
                                  value,
                                  selectedCountry?.isoCode || ''
                                ) || null
                              );
                            }}
                            value={field.value}
                            disabled={!selectedCountry}
                          >
                            <SelectTrigger
                              className="
                        h-12
                        rounded-lg
                        border-[#3A3A4A]
                        bg-[#191827]
                        text-sm
                        text-white
                        focus:border-[#7C2CFF]
                      "
                            >
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>

                            <SelectContent className="border-[#3A3A4A] bg-[#191827] text-white">
                              {availableStates.map(state => (
                                <SelectItem key={state.isoCode} value={state.isoCode}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldWrapper>

                    {/* COUNTRY */}
                    <FieldWrapper label="Country" required error={errors.country?.message}>
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
                            <SelectTrigger
                              className="
                        h-12
                        rounded-lg
                        border-[#3A3A4A]
                        bg-[#191827]
                        text-sm
                        text-white
                        focus:border-[#7C2CFF]
                      "
                            >
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>

                            <SelectContent className="max-h-72 border-[#3A3A4A] bg-[#191827] text-white">
                              {allCountries.map(country => (
                                <SelectItem key={country.isoCode} value={country.isoCode}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldWrapper>

                    {/* ZIP */}
                    <FieldWrapper label="Zipcode" error={errors.pinCode?.message}>
                      <div className="relative">
                        <InputIcon>
                          <Hash className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="pinCode"
                          placeholder="000100"
                          inputMode="numeric"
                          {...register('pinCode')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />
                      </div>
                    </FieldWrapper>
                  </div>

                  {/* =========================
              GST / DOMAIN / SUBSCRIPTION
          ========================== */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* GST */}
                    <FieldWrapper label="GST Number" error={errors.gstNo?.message}>
                      <div className="relative">
                        <InputIcon>
                          <CreditCard className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="gstNo"
                          placeholder="GST Number"
                          {...register('gstNo')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />
                      </div>
                    </FieldWrapper>

                    {/* DOMAIN */}
                    <FieldWrapper
                      label="Company Domain"
                      required
                      error={errors.companyDomain?.message}
                    >
                      <div className="relative">
                        <InputIcon>
                          <Globe2 className="h-4 w-4" />
                        </InputIcon>

                        <Input
                          id="companyDomain"
                          placeholder="company.com"
                          {...register('companyDomain')}
                          className="
                    h-12
                    rounded-lg
                    border-[#3A3A4A]
                    bg-[#191827]
                    pl-12
                    pr-10
                    text-sm
                    text-white
                    placeholder:text-white/40
                    focus:border-[#7C2CFF]
                    focus:ring-1
                    focus:ring-[#7C2CFF]/30
                  "
                        />

                        {isDomainValidating && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7C2CFF] border-t-transparent" />
                          </div>
                        )}
                      </div>
                    </FieldWrapper>

                    {/* SUBSCRIPTION */}
                    <FieldWrapper
                      label="Subscriber Type"
                      required
                      error={errors.subscriptionType?.message}
                    >
                      <Controller
                        name="subscriptionType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger
                              className="
                        h-12
                        rounded-lg
                        border-[#3A3A4A]
                        bg-[#191827]
                        text-sm
                        text-white
                        focus:border-[#7C2CFF]
                      "
                            >
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>

                            <SelectContent className="border-[#3A3A4A] bg-[#191827] text-white">
                              <SelectItem value="SUBSCRIBER">Subscriber</SelectItem>

                              <SelectItem value="TRIAL">Trial</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldWrapper>
                  </div>

                  {/* =========================
              TRIAL CREDITS
          ========================== */}
                  {subscriptionType === 'TRIAL' && (
                    <div className="max-w-md">
                      <FieldWrapper label="Add Credits" required error={errors.credits?.message}>
                        <div className="relative">
                          <InputIcon>
                            <CreditCard className="h-4 w-4" />
                          </InputIcon>

                          <Input
                            id="credits"
                            type="text"
                            placeholder="Enter Credits"
                            inputMode="numeric"
                            {...register('credits')}
                            onChange={e => {
                              const value = e.target.value.replace(/[^0-9]/g, '');

                              register('credits').onChange({
                                ...e,
                                target: {
                                  ...e.target,
                                  value,
                                },
                              });
                            }}
                            className="
                      h-12
                      rounded-lg
                      border-[#3A3A4A]
                      bg-[#191827]
                      pl-12
                      text-sm
                      text-white
                      placeholder:text-white/40
                      focus:border-[#7C2CFF]
                      focus:ring-1
                      focus:ring-[#7C2CFF]/30
                    "
                          />
                        </div>
                      </FieldWrapper>
                    </div>
                  )}
                </div>

                {/* =========================
            FOOTER
        ========================== */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#343346] bg-[#191827] px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNavigate}
                    className="
              h-11
              min-w-[120px]
              rounded-lg
              border-[#3A3A4A]
              bg-transparent
              text-sm
              font-medium
              text-white
              hover:bg-white/5
              hover:text-white
            "
                  >
                    Cancel
                  </Button>

                  {subscriptionType === 'SUBSCRIBER' ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting || emailValidationStatus !== 'valid'}
                      className="
                h-11
                min-w-[140px]
                rounded-lg
                border-0
                bg-gradient-to-r
                from-[#FF27D6]
                to-[#6419F5]
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-purple-900/20
                transition-all
                hover:from-[#FF3BDB]
                hover:to-[#7028FF]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
                    >
                      {isSubmitting ? 'Next...' : 'Next'}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || emailValidationStatus !== 'valid'}
                      className="
                h-11
                min-w-[140px]
                rounded-lg
                border-0
                bg-gradient-to-r
                from-[#FF27D6]
                to-[#6419F5]
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-purple-900/20
                transition-all
                hover:from-[#FF3BDB]
                hover:to-[#7028FF]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
                    >
                      {isSubmitting || isDomainValidating ? 'Saving...' : 'Save Company'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <PopupMessage
          isOpen={isSuccessOpen}
          onClose={() => {
            setIsSuccessOpen(false);
            dispatch(clearCompanyFormData());
            router.push('/companies');
          }}
          variant="success"
          title="Company added Successfully"
          message={
            addMEssage === 'add Credits'
              ? 'Do you want to add Credits'
              : 'Do you want to add another company?'
          }
          actions={[
            {
              label: 'Cancel',
              onClick: () => {
                setIsSuccessOpen(false);
                dispatch(clearCompanyFormData());
                router.push('/companies');
              },
              variant: 'outline',
              className: 'sm:w-56',
            },
            {
              // label: `${addMEssage}`,
              label: addMEssage === 'add Credits' ? 'Add more credits' : 'Add more company',
              onClick: () => {
                handleAddCompany(addMEssage);
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

        {/* New PopupMessage for Upload Errors */}
        <PopupMessage
          isOpen={isUploadErrorOpen}
          onClose={() => setIsUploadErrorOpen(false)}
          variant="error" // Assuming you have an 'error' variant for red styling
          title="Upload Error"
          message={uploadErrorMessage}
          actions={[
            {
              label: 'OK',
              onClick: () => setIsUploadErrorOpen(false),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
