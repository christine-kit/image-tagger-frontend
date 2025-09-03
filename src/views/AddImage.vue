<template>
  <div class="add-image-form">
    <h1>Add New Image</h1>

    <label>
      Image URL:
      <input type="text" v-model="url" required />
    </label>

    <label>
      Image Name (optional):
      <input type="text" v-model="imageName" />
    </label>

    <label>
      Description (optional):
      <textarea v-model="description" rows="3"></textarea>
    </label>

    <button :disabled="isSubmitting" @click="submitImage">
      {{ isSubmitting ? 'Submitting...' : 'Add New Image' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const url = ref('')
const imageName = ref('')
const description = ref('')
const isSubmitting = ref(false)
const error = ref(null)
const apiUrl = import.meta.env.VITE_API_URL
console.log('api url:', apiUrl)
async function submitImage() {
  if (!url.value.trim()) {
    error.value = 'Image URL is required.'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const response = await fetch(`${apiUrl}/addNewImage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url.value.trim(),
        image_name: imageName.value.trim() || undefined,
        description: description.value.trim() || undefined
      })
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    const result = await response.json()
    const imageId = result.image_id.replace('IMAGE-', '')
    router.push(`/image/${imageId}`)

  } catch (err) {
    error.value = 'Failed to add image: ' + err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.add-image-form {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  gap: 1rem;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error {
  color: red;
  font-weight: bold;
}
</style>