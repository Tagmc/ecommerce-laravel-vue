<!-- filepath: d:\code\web\ecommerce-vue-laravel\frontend\src\components\common\ToastContainer.vue -->

<template>
  <div class="toast-container fixed top-4 right-4 z-50">
    <transition-group name="toast">
      <div 
        v-for="(toast, index) in toasts" 
        :key="index"
        class="toast mb-2 p-4 rounded-lg shadow-lg flex items-start"
        :class="getToastClass(toast.type)"
      >
        <div class="toast-icon mr-3">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="toast-content flex-1">
          <div v-if="toast.title" class="toast-title font-bold mb-1">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast';

const { toasts } = useToast();

const getToastClass = (type: string = 'info') => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-l-4 border-green-500 text-green-900';
    case 'error':
      return 'bg-red-50 border-l-4 border-red-500 text-red-900';
    case 'warning':
      return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
    default:
      return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
  }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast {
  max-width: 400px;
  min-width: 300px;
}
</style>