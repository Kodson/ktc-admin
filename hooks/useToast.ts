import { toast } from 'sonner';
import { useNotifications } from '../contexts/NotificationContext';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  actionRequired?: boolean;
  relatedItem?: {
    type: 'sales_entry' | 'product_sharing' | 'supply' | 'expense';
    id: string;
    station?: string;
  };
}

export function useToast() {
  const { addNotification } = useNotifications();

  const showToast = {
    success: (message: string, options?: ToastOptions) => {
      toast.success(options?.title || 'Success', {
        description: message,
        duration: options?.duration || 4000,
      });

      // Also add to notification center if persistent or action required
      if (options?.persistent || options?.actionRequired) {
        addNotification({
          type: 'success',
          title: options?.title || 'Success',
          message,
          persistent: options?.persistent,
          actionRequired: options?.actionRequired,
          relatedItem: options?.relatedItem,
        });
      }
    },

    error: (message: string, options?: ToastOptions) => {
      toast.error(options?.title || 'Error', {
        description: message,
        duration: options?.duration || 6000,
      });

      // Always add errors to notification center
      addNotification({
        type: 'error',
        title: options?.title || 'Error',
        message,
        persistent: true,
        actionRequired: options?.actionRequired,
        relatedItem: options?.relatedItem,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      toast.warning(options?.title || 'Warning', {
        description: message,
        duration: options?.duration || 5000,
      });

      // Add warnings to notification center if persistent
      if (options?.persistent || options?.actionRequired) {
        addNotification({
          type: 'warning',
          title: options?.title || 'Warning',
          message,
          persistent: options?.persistent,
          actionRequired: options?.actionRequired,
          relatedItem: options?.relatedItem,
        });
      }
    },

    info: (message: string, options?: ToastOptions) => {
      toast.info(options?.title || 'Information', {
        description: message,
        duration: options?.duration || 4000,
      });

      // Add info to notification center if persistent
      if (options?.persistent || options?.actionRequired) {
        addNotification({
          type: 'info',
          title: options?.title || 'Information',
          message,
          persistent: options?.persistent,
          actionRequired: options?.actionRequired,
          relatedItem: options?.relatedItem,
        });
      }
    },

    // Custom toast for loading states
    loading: (message: string, promise?: Promise<any>) => {
      if (promise) {
        return toast.promise(promise, {
          loading: message,
          success: 'Operation completed successfully',
          error: 'Operation failed',
        });
      } else {
        return toast.loading(message);
      }
    },

    // Dismiss a specific toast
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId);
    },
  };

  return showToast;
}