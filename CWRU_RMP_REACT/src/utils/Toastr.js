// src/utils/Toastr.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default toast options
const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

// Error toast
export const showErrorToast = (message, options = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};
