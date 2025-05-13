<template>
  <div class="w-full max-w-md px-6 py-10 bg-white rounded-3xl shadow-2xl">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-extrabold text-purple-700">Đăng nhập vào shopX</h1>
      <p class="text-sm text-gray-500 mt-1">Teen yêu thời trang? Vào liền!</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <div>
        <label class="block mb-1 font-medium text-gray-700">Email</label>
        <input v-model="form.email" type="email" class="input input-bordered w-full" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-gray-700">Mật khẩu</label>
        <input v-model="form.password" type="password" class="input input-bordered w-full" required />
      </div>

      <button type="submit" class="btn btn-primary w-full mt-4">🚀 Đăng nhập</button>

      <div class="text-center mt-4 text-sm">
        <router-link to="/register" class="text-purple-600 hover:underline">
          Chưa có tài khoản? Đăng ký ngay ❤️
        </router-link>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import type { LoginPayload } from '../../types/auth';

const store = useStore();
const router = useRouter();

const form = reactive<LoginPayload>({
  email: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await store.dispatch('auth/login', form);
    router.push('/home');
    toast.success('🛍️ Đăng nhập thành công!');
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Đăng nhập thất bại';
    if (status === 401) {
      toast.error(message);
    } else {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
};
</script>
