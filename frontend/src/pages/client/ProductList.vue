<template>
  <div>
    <h1>Danh sách sản phẩm</h1>
    <div v-if="products.length === 0">Không có sản phẩm nào</div>
    <div v-for="product in products" :key="product.id">
      <router-link :to="`/products/${product.id}`">
        <h2>{{ product.name }}</h2>
        <p>{{ product.price }} VND</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProducts } from '../../apis/product';

const products = ref([]);

const fetchProducts = async () => {
  try {
    products.value = await getProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

onMounted(() => {
  fetchProducts();
});
</script>
