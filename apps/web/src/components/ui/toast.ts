import toast, { ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
  },
  iconTheme: {
    primary: '#16a34a',
    secondary: '#f0fdf4',
  },
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 5000,
  style: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
  },
  iconTheme: {
    primary: '#dc2626',
    secondary: '#fef2f2',
  },
};

const infoOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#eff6ff',
    color: '#1e40af',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
  },
  iconTheme: {
    primary: '#2563eb',
    secondary: '#eff6ff',
  },
};

const loadingOptions: ToastOptions = {
  duration: Infinity,
  position: 'top-right',
  style: {
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
  },
};

function toastSuccess(message: string, options?: ToastOptions): string {
  return toast.success(message, { ...successOptions, ...options });
}

function toastError(message: string, options?: ToastOptions): string {
  return toast.error(message, { ...errorOptions, ...options });
}

function toastInfo(message: string, options?: ToastOptions): string {
  return toast(message, {
    ...infoOptions,
    ...options,
    icon: 'ℹ️',
  });
}

function toastLoading(message: string, options?: ToastOptions): string {
  return toast.loading(message, { ...loadingOptions, ...options });
}

function toastDismiss(toastId?: string): void {
  toast.dismiss(toastId);
}

export { toastSuccess, toastError, toastInfo, toastLoading, toastDismiss };
