<template>
  <div id="app">
    <Loading />
    <router-view />
  </div>
</template>

<script lang="ts">
import Loading from './components/Loading.vue';
export default {
  components: {
    Loading,
  },
};
</script>
