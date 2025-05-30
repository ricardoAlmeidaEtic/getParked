import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  },
  loading: (message: string) => {
    toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
  },
  dismiss: () => {
    toast.dismiss();
  },
}; 