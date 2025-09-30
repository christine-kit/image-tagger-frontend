<template>
  <div class="toast-container">
    <TransitionGroup name="slide" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);

function showToast(msg, type = "default", duration = 4000) {
  const id = Date.now() + Math.random();
  toasts.value.push({ id: id, message: msg, type: type });

  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, duration);
}

defineExpose({ showToast });
</script>

<style>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast {
  padding: 10px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  opacity: 1;
  margin: 5px;
}

/* Error toast */
.toast.error {
  background: red;
  color: white;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}
.slide-enter-from {
  transform: translateX(120%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
</style>