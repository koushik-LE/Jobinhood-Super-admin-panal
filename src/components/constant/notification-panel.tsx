import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JSX } from 'react';
import { useState } from 'react';
import { Notification } from './notification';
import { IconMail } from '@tabler/icons-react';

interface NotificationProps {
  id: number;
  variant: 'success' | 'error' | 'default' | 'warning' | 'info'; // Fixed type here
  icon?: JSX.Element;
  title: string;
  description: string;
  timestamp: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  // Corrected useState declaration with type annotation
  const [notifications, setNotifications] = useState<NotificationProps[]>([
    {
      id: 1,
      variant: 'success',
      icon: <IconMail className="h-5 w-5 text-red20" />, // Example icon
      title: 'You received a top-up request from infosys ',
      description: 'Hi swaroop, I need  more credits.',
      timestamp: '14 Feb, 2025 at 7:10 PM',
    },
    {
      id: 2,
      variant: 'success',
      icon: <IconMail className="h-4 w-4 text-red20" />, // Example icon
      title: 'You received a top-up request from infosys ',
      description: 'Hi swaroop, I need  more credits.',
      timestamp: '2m ago',
    },
    {
      id: 3,
      variant: 'success',
      icon: <IconMail className="h-4 w-4 text-red20" />, // Example icon
      title: 'You received a top-up request from infosys ',
      description: 'Hi swaroop, I need  more credits.',
      timestamp: '2m ago',
    },
    {
      id: 4,
      variant: 'success',
      icon: <IconMail className="h-4 w-4 text-red20" />, // Example icon
      title: 'You received a top-up request from infosys ',
      description: 'Hi swaroop, I need  more credits.',
      timestamp: '2m ago',
    },
    {
      id: 5,
      variant: 'success',
      icon: <IconMail className="h-4 w-4 text-red20" />, // Example icon
      title: 'You received a top-up request from infosys ',
      description: 'Hi swaroop, I need  more credits.',
      timestamp: '2m ago',
    },
    {
      id: 6,
      variant: 'success',
      icon: <IconMail className="h-4 w-4 text-red20" />, // Example icon
      title: 'You received a top-up request from infosys ',
      description: 'Hi swaroop, I need  more credits.',
      timestamp: '2m ago',
    },
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 md:p-8">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40" onClick={onClose} />

      {/* Notification Panel with dark mode support */}
      <div className="relative z-50 w-full max-w-xl max-h-screen rounded-lg bg-white dark:bg-black dark:border dark:border-gray-700 shadow-lg animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-white" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Notification List with Fixed Scroll Height */}
        <ScrollArea className="h-[500px] overflow-y-auto">
          <div className="p-6 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <Notification
                  key={notification.id}
                  variant={notification.variant}
                  icon={notification.icon}
                  title={notification.title}
                  description={notification.description}
                  timestamp={notification.timestamp}
                  className="dark:bg-gray-900 dark:text-white"
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
