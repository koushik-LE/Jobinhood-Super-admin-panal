'use client';

import { useEffect, type ReactNode, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Info, CheckCircle2, AlertTriangle, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import warningIcon from '@/assets/icon-park-solid_caution.svg';
import { useRouter } from 'next/navigation';

/* ============================================================
   OVERLAY
============================================================ */

const popupVariants = cva(
  `
    fixed
    inset-0
    z-[100]
    flex
    items-center
    justify-center
    bg-black/75
    backdrop-blur-sm
    p-4
    sm:p-6
  `,
  {
    variants: {
      variant: {
        success: '',
        error: '',
        warning: '',
        info: '',
      },
    },

    defaultVariants: {
      variant: 'info',
    },
  }
);

/* ============================================================
   CONTENT
============================================================ */

const contentVariants = cva(
  `
    relative
    w-full
    max-w-md
    overflow-hidden
    rounded-2xl
    border
    border-[#3A394D]
    bg-[#1A192D]
    shadow-2xl
    shadow-black/50
    p-6
    sm:p-8
    animate-in
    fade-in
    zoom-in-95
    duration-200
  `,
  {
    variants: {
      variant: {
        success: '',
        error: '',
        warning: '',
        info: '',
      },
    },

    defaultVariants: {
      variant: 'info',
    },
  }
);

/* ============================================================
   ICONS
============================================================ */

const iconMap = {
  success: IconRosetteDiscountCheckFilled,
  error: CircleAlert,
  warning: AlertTriangle,
  info: Info,
};

/* ============================================================
   IMAGE ICONS
============================================================ */

const imageMap: Partial<Record<string, StaticImageData>> = {
  warning: warningIcon,
};

/* ============================================================
   COLORS
============================================================ */

const colorMap = {
  success: {
    icon: 'text-[#22C55E]',
    background: 'bg-[#123C2A]',
    border: 'border-[#1D6B45]',
  },

  error: {
    icon: 'text-[#EF4444]',
    background: 'bg-[#421C24]',
    border: 'border-[#7F2633]',
  },

  warning: {
    icon: 'text-[#F59E0B]',
    background: 'bg-[#493415]',
    border: 'border-[#7A5520]',
  },

  info: {
    icon: 'text-[#8B5CF6]',
    background: 'bg-[#29155F]',
    border: 'border-[#4B2A9D]',
  },
};

/* ============================================================
   TYPES
============================================================ */

export interface PopupAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export interface PopupMessageProps extends VariantProps<typeof popupVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  actions?: PopupAction[];
  showIcon?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  autoClose?: number;
  navigateOnClose?: boolean | string;
}

/* ============================================================
   COMPONENT
============================================================ */

export function PopupMessage({
  isOpen,
  onClose,
  title,
  message,
  actions = [],
  variant = 'info',
  showIcon = true,
  hideCloseButton = false,
  className,
  contentClassName,
  children,
  autoClose,
  navigateOnClose,
}: PopupMessageProps) {
  const router = useRouter();

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose = useCallback(() => {
    onClose?.();

    if (navigateOnClose) {
      if (typeof navigateOnClose === 'string') {
        router.push(navigateOnClose);
      } else {
        router.back();
      }
    }
  }, [onClose, navigateOnClose, router]);

  /* ==========================================================
     ESC KEY + BODY SCROLL
  ========================================================== */

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = previousOverflow;
      };
    }

    return undefined;
  }, [handleClose, isOpen]);

  /* ==========================================================
     AUTO CLOSE
  ========================================================== */

  useEffect(() => {
    if (!isOpen || !autoClose) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoClose);

    return () => clearTimeout(timer);
  }, [isOpen, autoClose, handleClose]);

  /* ==========================================================
     DON'T RENDER
  ========================================================== */

  if (!isOpen) return null;

  /* ==========================================================
     VARIANT
  ========================================================== */

  const IconComponent = iconMap[variant as keyof typeof iconMap] || Info;

  const imageSrc = imageMap[variant as string];

  const colors = colorMap[variant as keyof typeof colorMap] || colorMap.info;

  return (
    <div
      className={cn(
        popupVariants({
          variant,
          className,
        })
      )}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="Close dialog"
      />

      {/* ======================================================
          MODAL
      ====================================================== */}

      <div
        className={cn(contentVariants({ variant }), contentClassName)}
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* ====================================================
            CLOSE BUTTON
        ==================================================== */}

        {!hideCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="
              absolute
              right-4
              top-4
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition-all
              duration-200
              hover:bg-white/10
              hover:text-white
            "
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="flex flex-col items-center text-center">
          {/* ==================================================
              ICON
          ================================================== */}

          {showIcon && (
            <div
              className={cn(
                `
                  mb-5
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                `,
                colors.background,
                colors.border
              )}
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={`${variant} icon`}
                  width={34}
                  height={34}
                  className="h-8 w-8"
                />
              ) : (
                <IconComponent className={cn('h-9 w-9', colors.icon)} />
              )}
            </div>
          )}

          {/* ==================================================
              TITLE
          ================================================== */}

          {title && (
            <h3
              className="
                mb-3
                px-6
                text-xl
                sm:text-2xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              {title}
            </h3>
          )}

          {/* ==================================================
              MESSAGE
          ================================================== */}

          {message && (
            <p
              className="
                max-w-sm
                px-4
                text-sm
                sm:text-base
                leading-6
                text-gray-400
              "
            >
              {message}
            </p>
          )}

          {/* ==================================================
              CHILDREN
          ================================================== */}

          {children && <div className="mt-5 w-full">{children}</div>}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          {actions.length > 0 && (
            <div
              className={cn(
                `
                  mt-7
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-3
                `,
                actions.length > 2 ? 'flex-col' : 'flex-col sm:flex-row'
              )}
            >
              {actions.map((action, index) => {
                const isPrimary = index === actions.length - 1;

                return (
                  <Button
                    key={`${action.label}-${index}`}
                    type="button"
                    variant={action.variant || (isPrimary ? 'default' : 'outline')}
                    onClick={action.onClick}
                    className={cn(
                      `
                        h-11
                        w-full
                        rounded-lg
                        px-6
                        text-sm
                        font-semibold
                        transition-all
                        duration-300
                      `,
                      isPrimary
                        ? `
                          border-0
                          bg-gradient-to-r
                          from-[#E83DDA]
                          to-[#5D1BEF]
                          text-white
                          shadow-lg
                          shadow-purple-900/20
                          hover:from-[#F04BE3]
                          hover:to-[#6C29FF]
                          hover:shadow-purple-900/40
                        `
                        : `
                          border-[#444359]
                          bg-transparent
                          text-gray-200
                          hover:bg-white/5
                          hover:border-[#5A596E]
                          hover:text-white
                        `,
                      actions.length === 2 && 'sm:w-auto sm:min-w-[120px]',
                      action.className
                    )}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
