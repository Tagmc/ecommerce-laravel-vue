// filepath: d:\code\web\ecommerce-vue-laravel\frontend\src\composables\useToast.ts

import { ref } from 'vue';

interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Singleton toast state
const toasts = ref<ToastOptions[]>([]);

export function useToast() {
  const showToast = (
    messageOrOptions: string | ToastOptions,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ) => {
    let toast: ToastOptions;
    
    if (typeof messageOrOptions === 'string') {
      toast = {
        message: messageOrOptions,
        type,
        duration
      };
    } else {
      toast = {
        ...messageOrOptions,
        duration: messageOrOptions.duration || duration
      };
    }
    
    // Add toast to the list
    toasts.value.push(toast);
    
    // Remove toast after duration
    setTimeout(() => {
      const index = toasts.value.indexOf(toast);
      if (index !== -1) {
        toasts.value.splice(index, 1);
      }
    }, toast.duration);
  };
  
  return {
    toasts,
    showToast,
  };
}