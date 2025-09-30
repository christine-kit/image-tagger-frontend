<template>
  <div class="wrapper">
    <header>
      <nav>
        <RouterLink to="/search">Search</RouterLink>
        |
        <RouterLink to="/addimage">New Image</RouterLink>
      </nav>
    </header>

    <RouterView />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import Toast from './components/Toast.vue';

const toast = ref(null);

// provide the toast function globally
provide('toast', (...args) => toast.value.showToast(...args));
</script>