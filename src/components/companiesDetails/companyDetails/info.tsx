'use client';

import Image from 'next/image';
import { IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import Group from '@/Icons/companyDetails-Icons/Group.svg';
import Vector from '@/Icons/companyDetails-Icons/Vector.svg';
import Location from '@/Icons/companyDetails-Icons/carbon_location.svg';
import Email from '@/Icons/companyDetails-Icons/mdi-light_email.svg';
import Edit from '@/Icons/companyDetails-Icons/material-symbols_edit-outline.svg';
import Phone from '@/Icons/companyDetails-Icons/mdi-light_phone.svg';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/constant/custom-toast';

interface CompanyData {
  companyName: string;
  contactPerson?: string;
  createdAt?: string;
  contactNumber?: string;
  status?: string;
  address?: {
    addressLine?: string;
    country?: string;
    state?: string;
    city?: string;
    pinCode?: string;
  };
  gst?: string;
  domain?: string;
  contactEmail?: string;
  subscriptionType?: string;
  transactionDetails?: Array<{
    addCredits?: string;
  }>;
}

const ProfileCard = ({ id }: { id: string }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      try {
        setLoading(true);

        const response = await axios.post(
          '/api/company/getcompany',
          { id },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          setCompany(response.data.data);
        }
      } catch {
        showToast('error', 'Company details failed');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleEdit = () => {
    router.push(`/companies/edit/${id}`);
  };

  const isDeactivated = company?.status?.toLowerCase() === 'deactive';

  const formatDate = (date?: string) => {
    if (!date) return 'Date not specified';

    return new Date(date).toLocaleDateString('en-GB').replaceAll('/', '-');
  };

  return (
    <div
      className="
        w-full
        rounded-xl
        border
        border-[#38384A]
        bg-[#191827]
        px-5
        py-4
        sm:px-7
        sm:py-5
        text-white
      "
    >
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="flex items-center justify-between gap-4">
        {loading ? (
          <Skeleton className="h-6 w-48 bg-white/10" />
        ) : (
          <h2 className="text-lg sm:text-xl font-semibold text-white">Company Information</h2>
        )}

        {loading ? (
          <Skeleton className="h-9 w-20 rounded-md bg-white/10" />
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            disabled={isDeactivated}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              h-9
              px-4
              rounded-md
              border
              text-sm
              font-medium
              transition-all
              duration-200
              shrink-0
              ${
                isDeactivated
                  ? `
                    border-gray-600
                    bg-gray-700/40
                    text-gray-500
                    cursor-not-allowed
                  `
                  : `
                    border-[#D026FF]
                    bg-transparent
                    text-white
                    hover:bg-[#D026FF]/10
                    hover:border-[#E05AFF]
                  `
              }
            `}
          >
            {!isDeactivated && <span className="text-[#D026FF] text-base leading-none">+</span>}
            {!isDeactivated && (
              <Image src={Edit} alt="Edit" width={15} height={15} className="hidden" />
            )}
            Edit
          </button>
        )}
      </div>

      {/* =========================================================
          COMPANY MAIN INFORMATION
      ========================================================= */}
      <div className="mt-4 sm:mt-5">
        <div className="flex items-start gap-4">
          {/* Company Avatar */}
          {loading ? (
            <Skeleton className="h-14 w-14 rounded-lg bg-white/10 shrink-0" />
          ) : (
            <Avatar
              className="
                h-14
                w-14
                rounded-lg
                border
                border-[#7127FF]
                bg-[#211947]
              "
            >
              <AvatarFallback
                className="
                  rounded-lg
                  bg-[#211947]
                  text-white
                  text-xl
                  font-semibold
                "
              >
                {company?.companyName?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Company Information */}
          <div className="min-w-0 flex-1">
            {/* Company Name */}
            {loading ? (
              <Skeleton className="h-5 w-36 bg-white/10" />
            ) : (
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                {company?.companyName || 'Company Name'}
              </h3>
            )}

            {/* Contact + GST */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {/* Contact Person */}
              <div className="flex items-center gap-2 min-w-0">
                {loading ? (
                  <Skeleton className="h-4 w-4 bg-white/10" />
                ) : (
                  <IconUser size={16} strokeWidth={1.5} className="text-gray-300 shrink-0" />
                )}

                {loading ? (
                  <Skeleton className="h-4 w-24 bg-white/10" />
                ) : (
                  <span className="text-sm text-gray-200 truncate">
                    {company?.contactPerson || 'Contact Person'}
                  </span>
                )}
              </div>

              {/* Divider */}
              <span className="hidden sm:block h-5 w-px bg-gray-600" />

              {/* GST */}
              <div className="flex items-center gap-2 min-w-0">
                {loading ? (
                  <Skeleton className="h-4 w-4 bg-white/10" />
                ) : (
                  <Image src={Group} alt="GSTIN" width={16} height={16} className="shrink-0" />
                )}

                {loading ? (
                  <Skeleton className="h-4 w-40 bg-white/10" />
                ) : (
                  <span className="text-sm text-gray-200 truncate">
                    GSTIN: {company?.gst || 'Not Available'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          COMPANY DETAILS
      ========================================================= */}
      <div className="mt-4 sm:mt-5 space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2">
          {loading ? (
            <Skeleton className="h-4 w-4 bg-white/10 shrink-0" />
          ) : (
            <Image
              src={Location}
              alt="Location"
              width={16}
              height={16}
              className="mt-0.5 shrink-0"
            />
          )}

          {loading ? (
            <Skeleton className="h-4 w-80 max-w-full bg-white/10" />
          ) : (
            <span className="text-sm text-gray-200 leading-5 break-words">
              {company?.address?.addressLine || 'Address not specified'}
              {company?.address?.city && `, ${company.address.city}`}
              {company?.address?.state && `, ${company.address.state}`}
              {company?.address?.country && `, ${company.address.country}`}
              {company?.address?.pinCode && `, ${company.address.pinCode}`}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-4 w-4 bg-white/10 shrink-0" />
          ) : (
            <Image src={Email} alt="Email" width={16} height={16} className="shrink-0" />
          )}

          {loading ? (
            <Skeleton className="h-4 w-48 bg-white/10" />
          ) : (
            <span className="text-sm text-gray-200 truncate">
              {company?.contactEmail || 'Email not specified'}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-4 w-4 bg-white/10 shrink-0" />
          ) : (
            <Image src={Phone} alt="Phone" width={16} height={16} className="shrink-0" />
          )}

          {loading ? (
            <Skeleton className="h-4 w-40 bg-white/10" />
          ) : (
            <span className="text-sm text-gray-200">
              {company?.contactNumber || 'Phone not specified'}
            </span>
          )}
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-4 w-4 bg-white/10 shrink-0" />
          ) : (
            <Image src={Vector} alt="Created Date" width={16} height={16} className="shrink-0" />
          )}

          {loading ? (
            <Skeleton className="h-4 w-28 bg-white/10" />
          ) : (
            <span className="text-sm text-gray-200">{formatDate(company?.createdAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
