<template>
  <div :class="['tag', {'pending': pending}]">
    <router-link :to="`/tag/${tagId}`" class="tag-text">
      {{ tagId }}
    </router-link>
    <button class="delete-button" @click="removeTag">x</button>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const emit = defineEmits(['removeTag']);

const props = defineProps({
  tagId: String,
  pending: {
    type: Boolean,
    default: false
  }
})

function removeTag() {
  emit('removeTag', props.tagId)
}
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 5px;
  padding: 0.25rem 0.5rem;
  margin: 0.2rem;
  font-size: 0.9rem;
}

.tag:hover {
  background-color: #d0d0d0; /* Slightly darker on hover */
}

.pending {
  opacity: 0.5;
}

.tag-text {
  text-decoration: none;
  color: #333;
  margin-right: 0.5rem;
}

.delete-button {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-button:hover {
  color: red;
}
</style>
