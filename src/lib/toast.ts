import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: 500,
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: 500,
      },
    });
  },
  loading: (message: string) => {
    toast.loading(message, {
      position: 'bottom-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: 500,
      },
    });
  },
  dismiss: () => {
    toast.dismiss();
  },
}; 