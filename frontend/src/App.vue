<template>
  <div id="app">
    <Loading />
    <router-view />
    <ToastContainer />
  </div>
</template>

<script lang="ts">
import ToastContainer from './components/common/ToastContainer.vue';
import Loading from './components/Loading.vue';
export default {
  components: {
    Loading,
  },
};
</script>
