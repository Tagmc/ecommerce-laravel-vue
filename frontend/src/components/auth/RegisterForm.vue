<template>
  <div class="w-full max-w-md px-6 py-10 bg-white rounded-3xl shadow-2xl">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-extrabold text-purple-700">Tạo tài khoản shopX</h1>
      <p class="text-sm text-gray-500 mt-1">Teen mua sắm, teen vui vẻ 💖</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block mb-1 font-medium text-gray-700">Họ tên</label>
        <input v-model="form.name" type="text" class="input input-bordered w-full" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-gray-700">Email</label>
        <input v-model="form.email" type="email" class="input input-bordered w-full" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-gray-700">Mật khẩu</label>
        <input v-model="form.password" type="password" class="input input-bordered w-full" required />
      </div>

      <div>
        <label class="block mb-1 font-medium text-gray-700">Nhập lại mật khẩu</label>
        <input v-model="form.password_confirmation" type="password" class="input input-bordered w-full" required />
      </div>

      <button type="submit" class="btn btn-primary w-full mt-4">🎉 Đăng ký</button>

      <div class="text-center mt-4 text-sm">
        <router-link to="/login" class="text-purple-600 hover:underline">
          Đã có tài khoản? Đăng nhập nhé 🚪
        </router-link>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import type { RegisterPayload, ErrorResponse } from '../../types/auth';
import { toast } from 'vue3-toastify';

const store = useStore();
const router = useRouter();

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

const handleRegister = async () => {
  try {
    await store.dispatch('auth/register', form);
    toast.success('🌟 Đăng ký thành công!');
    router.push('/login');
  } catch (error: any) {
    const errorResponse: ErrorResponse = error.response?.data || { message: 'Đăng ký thất bại' };
    toast.error(errorResponse.message);
  }
};
</script>
