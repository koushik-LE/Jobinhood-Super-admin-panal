'use client';

import * as React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const iconVariants = cva('size-12 rounded-full p-2', {
  variants: {
    variant: {
      success: 'bg-[#3dcf81] text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-amber-500 text-white',
      error: 'bg-red-500 text-white',
    },
  },
  defaultVariants: {
    variant: 'success',
  },
});

const buttonVariants = cva('flex-1 rounded-md px-4 py-2 font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue10 text-white hover:bg-blue10/90',
      secondary: 'border border-[#ababab] text-[#344054] hover:bg-gray-50',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export interface SuccessPopoverProps extends VariantProps<typeof iconVariants> {
  title: string;
  description?: string;
  primaryActionText?: string;
  secondaryActionText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function SuccessPopover({
  title,
  description,
  primaryActionText = 'Continue',
  secondaryActionText = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  open,
  onOpenChange,
  trigger,
  variant = 'success',
  className,
}: SuccessPopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handlePrimaryAction = () => {
    onPrimaryAction?.();
    if (!isControlled) {
      setInternalOpen(false);
    }
  };

  const handleSecondaryAction = () => {
    onSecondaryAction?.();
    if (!isControlled) {
      setInternalOpen(false);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <Check className="size-8" />;
      case 'info':
        return <Info className="size-8" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="size-8" />;
      default:
        return <Check className="size-8" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent
        className={cn(
          'w-[90vw] max-w-md rounded-xl p-6 shadow-lg border border-gray-100',
          className
        )}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={cn(iconVariants({ variant }))}>{getIcon()}</div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-black10">{title}</h2>
            {description && <div className="text-lg text-[#344054]">{description}</div>}
          </div>

          <div className="flex w-full gap-4 pt-4">
            {secondaryActionText && (
              <button
                onClick={handleSecondaryAction}
                className={buttonVariants({ variant: 'secondary' })}
              >
                {secondaryActionText}
              </button>
            )}
            {primaryActionText && (
              <button
                onClick={handlePrimaryAction}
                className={buttonVariants({ variant: 'primary' })}
              >
                {primaryActionText}
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
