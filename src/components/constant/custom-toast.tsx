'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const toastIcons = {
  success: <CheckCircle className="text-green-500 w-6 h-6" />,
  error: <XCircle className="text-red-500 w-6 h-6" />,
  info: <Info className="text-brand w-6 h-6" />,
  warning: <AlertTriangle className="text-yellow-500 w-6 h-6" />,
};

export const showToast = (type: ToastType, message: string, description?: string) => {
  toast.custom(
    t => (
      <div className="flex items-center gap-4 p-4 rounded-lg shadow-lg text-white bg-gray-900 border border-gray-700">
        {toastIcons[type]}
        <div>
          <p className="font-semibold">{message}</p>
          {description && <p className="text-gray-300 text-sm">{description}</p>}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          onClick={() => toast.dismiss(t)}
        >
          Dismiss
        </Button>
      </div>
    ),
    { duration: 5000 }
  );
};
