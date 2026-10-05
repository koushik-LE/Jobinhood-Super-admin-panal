'use client';

import type React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import { motion } from 'framer-motion';
import { PopupMessage } from '@/components/constant/popup-message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, UserRound, Mail, BriefcaseBusiness } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { showToast } from '@/components/constant/custom-toast';

export default function AddUser() {
  const [formData, setFormData] = useState({
    companyName: '',
    userName: '',
    designation: '',
    email: '',
  });

  const [errors, setErrors] = useState({
    userName: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const companyId = searchParams.get('companyId');
  const companyName = searchParams.get('companyName');

  const companyInitial = useMemo(
    () => (companyName ? companyName.charAt(0).toUpperCase() : 'C'),
    [companyName]
  );

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = useCallback(() => {
    let valid = true;

    const newErrors = {
      userName: '',
      email: '',
    };

    // User name
    if (!formData.userName.trim()) {
      newErrors.userName = 'User Name is required';
      valid = false;
    } else if (/[^a-zA-Z0-9 ]/.test(formData.userName)) {
      newErrors.userName = 'User Name cannot contain special characters';
      valid = false;
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email ID is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  }, [formData.userName, formData.email]);

  /* ============================================================
     INPUT CHANGE
  ============================================================ */

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setErrors(prev => {
      if (prev[name as keyof typeof prev]) {
        return {
          ...prev,
          [name]: '',
        };
      }

      return prev;
    });
  }, []);

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      const reqBody = {
        companyId,
        name: formData.userName,
        designation: formData.designation,
        email: formData.email,
      };

      try {
        const response = await axios.post('/api/company/addUser', reqBody);

        if (response.status === 200) {
          setIsSuccessOpen(true);
        } else {
          showToast('error', 'Failed to add user');
        }
      } catch (error: unknown) {
        let errorMessage =
          (
            error as {
              response?: {
                data?: {
                  error?: string;
                };
              };
            }
          )?.response?.data?.error ||
          (error as Error)?.message ||
          'Failed to add user';

        if (errorMessage === 'name Must contain only alphabets and spaces') {
          errorMessage = 'Name must contain only alphabets and spaces.';
        }

        showToast('error', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyId, formData, validateForm]
  );

  /* ============================================================
     SUCCESS ACTIONS
  ============================================================ */

  const successPopupActions = useMemo(
    () => [
      {
        label: 'Cancel',
        onClick: () => {
          setIsSuccessOpen(false);
          router.back();
        },
        variant: 'outline' as const,
        className: 'sm:w-40',
      },
      {
        label: 'Add More User',
        onClick: () => {
          setIsSuccessOpen(false);

          setFormData({
            companyName: '',
            userName: '',
            designation: '',
            email: '',
          });

          setErrors({
            userName: '',
            email: '',
          });
        },
        className: 'sm:w-40',
      },
    ],
    [router]
  );

  /* ============================================================
     RETURN
  ============================================================ */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#111111] text-white">
        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="
              group
              flex
              items-center
              gap-4
              text-white
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

            <h1
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-bold
                tracking-tight
              "
            >
              Add User
            </h1>
          </button>
        </motion.div>

        {/* ======================================================
            MAIN CARD
        ====================================================== */}

        <div className="px-4 sm:px-6 lg:px-10 mt-8 pb-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            className="
              w-full
              overflow-hidden
              rounded-lg
              border
              border-[#3A3A4A]
              bg-[#1A192D]
            "
          >
            {/* ==================================================
                COMPANY HEADER
            ================================================== */}

            <div
              className="
                px-6
                sm:px-8
                lg:px-10
                pt-7
                sm:pt-8
                pb-7
              "
            >
              <div className="flex items-center gap-5">
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
                    {companyInitial}
                  </AvatarFallback>
                </Avatar>

                {/* Company */}

                <div className="min-w-0">
                  <p
                    className="
                      mb-1
                      text-xs
                      sm:text-sm
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    Company
                  </p>

                  <h2
                    className="
                      text-2xl
                      sm:text-3xl
                      font-bold
                      text-white
                      truncate
                    "
                  >
                    {companyName || 'Company'}
                  </h2>
                </div>
              </div>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form onSubmit={handleSubmit}>
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
                {/* =================================================
                    NAME
                ================================================= */}

                <div>
                  <label
                    htmlFor="userName"
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
                    Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

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
                        text-[#8B5CF6]
                        pointer-events-none
                      "
                    >
                      <UserRound size={17} />
                    </div>

                    <Input
                      id="userName"
                      name="userName"
                      placeholder="Enter Full Name"
                      value={formData.userName}
                      onChange={handleChange}
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

                  {errors.userName && (
                    <p className="mt-2 text-xs text-red-400">{errors.userName}</p>
                  )}
                </div>

                {/* =================================================
                    EMAIL
                ================================================= */}

                <div>
                  <label
                    htmlFor="email"
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
                    Email ID
                    <span className="ml-1 text-red-500">*</span>
                  </label>

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
                        text-[#8B5CF6]
                        pointer-events-none
                      "
                    >
                      <Mail size={17} />
                    </div>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleChange}
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

                  {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email}</p>}
                </div>

                {/* =================================================
                    DESIGNATION
                ================================================= */}

                <div>
                  <label
                    htmlFor="designation"
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
                    Designation
                  </label>

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
                        text-[#8B5CF6]
                        pointer-events-none
                      "
                    >
                      <BriefcaseBusiness size={17} />
                    </div>

                    <Input
                      id="designation"
                      name="designation"
                      placeholder="Enter Designation"
                      value={formData.designation}
                      onChange={handleChange}
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
                </div>
              </div>

              {/* ==================================================
                  ACTION BAR
              ================================================== */}

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
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="
                    h-[54px]
                    min-w-[120px]
                    rounded-lg
                    border
                    border-[#444359]
                    bg-transparent
                    px-6
                    text-sm
                    font-medium
                    text-gray-200
                    hover:bg-white/5
                    hover:border-[#5A596E]
                    hover:text-white
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
                    min-w-[160px]
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
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ======================================================
            SUCCESS POPUP
        ====================================================== */}

        <PopupMessage
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          variant="success"
          title="User Added Successfully"
          message="Do you want to add another user?"
          actions={successPopupActions}
        />
      </div>
    </DashboardLayout>
  );
}
