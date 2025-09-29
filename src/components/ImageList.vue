<!-- Component for displaying list of images -->

<template>
  <div class="image-list">
    <div 
      v-for="(image, index) in imageData" 
      :key="index" 
      class="image-item"
    >
      <RouterLink :to="`/image/${image.primary_id}`">
        <img :src="image.url" :alt="image.image_name" class="image-preview" />
      </RouterLink>
      <RouterLink :to="`/image/${image.primary_id}`" class="image-name">
        {{ image.image_name }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref, watch } from 'vue'
const props = defineProps({
  imageList: Array,
})

const imageData = ref([]);
const apiUrl = import.meta.env.VITE_API_URL

onMounted(() => {
  console.log("image list subcomponent mounted")
  fetchImageData(props.imageList);
})
watch(
  () => props.imageList,
  (newVal, oldVal) => {
    console.log('list changed')
    fetchImageData(newVal)
  },
  { deep:true }
)
async function fetchImageData(imageIds) {
  imageData.value = []
  const chunks = chunkArray(imageIds, 10);

  console.log('fetching image urls')
  for (const chunk of chunks) {
    const query = chunk.map(id => `id=${encodeURIComponent(id)}`).join('&');
    const url = `${apiUrl}/getImage?${query}`

    try {
      const res = await fetch(url, {
        method: 'GET'
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch chunk: ${chunk.join(', ')}`)
      }
      const chunkData = await res.json()
      imageData.value.push(...chunkData)
    } catch (err) {
      console.error('Error when fetching image data:', err)
    }
  }
  console.log('new image data array:', imageData.value)
}

function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
</script>

<style scoped>
.image-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.image-preview {
  border-radius: 8px;
  max-width: 300px;   
  max-height: 200px; 
  width: auto;        
  height: auto;     
}

.image-name {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.25rem;
  text-decoration: none;
}
</style>