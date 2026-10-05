import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const notificationVariants = cva('relative w-full rounded-lg p-4 transition-all', {
  variants: {
    variant: {
      default:
        'bg-white dark:bg-black20 border dark:border-[#333] text-gray-900 dark:text-gray-200',
      success:
        'bg-white border-b-2 dark:border-b-0 dark:border-l-4 dark:bg-black20 dark:border-green-500 dark:text-green-400',
      error:
        'bg-white border-l-4 border-red-500 dark:bg-black20 dark:border-red-500 dark:text-red-400',
      warning:
        'bg-white border-l-4 border-amber-500 dark:bg-black20 dark:border-amber-500 dark:text-amber-400',
      info: 'bg-white border-l-4 border-blue-500 dark:bg-black20 dark:border-blue-500 dark:text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof notificationVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  timestamp?: string;
  onClose?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, variant, title, description, icon, timestamp, onClose, ...props }, ref) => (
    <div ref={ref} className={cn(notificationVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-4">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</div>
          )}
          {description && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</div>
          )}
        </div>
        {timestamp && (
          <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">{timestamp}</div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 inline-flex flex-shrink-0 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
);
Notification.displayName = 'Notification';

export { Notification, notificationVariants };
