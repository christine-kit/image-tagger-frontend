<template>
  <div class="display-image">
    <h1>Image</h1>

    <div v-if="error" class="error">
      <p>Error: {{ error }}</p>
    </div>

    <div v-else-if="loading">
      <p>Loading image...</p>
    </div>

    <div v-else>
      <img
        :src="imageData.url"
        alt="Loaded Image"
        @error="handleImageError"
        v-if="!imageLoadError"
      />
      <p v-else class="error">Failed to load image from URL.</p>

      <h2>{{ imageData.image_name }}</h2>
      <p>{{ imageData.description }}</p>
    </div>
  </div>
  <div class="tag-list">
    <Tag
      v-for="(tag, index) in tags"
      :key="index"
      :tagId="tag.tagId"
      :pending="tag.pending"
      @removeTag="handleRemoveTag"
    />
    <button class="add-tag-button" 
      v-if="!isAddingTag" @click="isAddingTag = true">
      +
    </button>
    <TagInput
      v-else
      @addTag="addTag"
      @cancel="isAddingTag = false"
      @blurred="onInputBlurred"
      :initialValue="savedInputText"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { ref, onMounted } from 'vue'

import Tag from '@/components/Tag.vue'
import TagInput from '@/components/TagInput.vue'
import { nextTick } from 'vue'

const props = defineProps({
  id: String
})

const imageData = ref({});
const error = ref(null);
const loading = ref(true);
const imageLoadError = ref(false);
const tags = ref([]);
const isAddingTag = ref(false);
const savedInputText = ref('');
const apiUrl = import.meta.env.VITE_API_URL

onMounted(async () => {
  await fetchImageData();
  await fetchTags();
});

async function fetchTags() {
  try {
    const response = await fetch(`${apiUrl}/queryTagsByImage?id=${props.id}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Tags API returned ${response.status}`);
    }

    const tagData = await response.json();
    tags.value = tagData.map(tag => ({tagId: tag, pending:false}));
  } catch (err) {
    console.error('Failed to fetch tags:', err);
  }
}

async function fetchImageData() {
  try {
    const response = await fetch(`${apiUrl}/getImage?id=${props.id}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    imageData.value = data[0];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// synchronously display change to user and call API asynchronously
async function addTag(tag) {
  console.log(`adding tag ${tag} to image`);
  // display pending tag to user
  performance.mark('tag-pushed')
  tags.value.push({tagId:tag, pending:true});
  await nextTick();
  performance.mark('tag-painted')
  performance.measure('paint delay', 'tag-pushed', 'tag-painted')
  addTagToImage(tag)
}

async function addTagToImage(tag) {
  try {
    const response = await fetch(`${apiUrl}/addTagToImage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        image_id: props.id,
        tag_id: tag
      })
    });
    if (!response.ok) {
      // TODO: show user error message
    } else {
      // tag successfully added to image, remove pending state from tag
      console.log(`tag ${tag} added to image`);
      const t = tags.value.find(t => t.tagId === tag)
      if (t) t.pending = false
    }
  } catch (err) {
    console.error('Failed to add tag to image');
  }
}

function onInputBlurred(text) {
  savedInputText.value = text;
  isAddingTag.value = false;
  console.log("saved text:", savedInputText.value);
}

async function handleRemoveTag(tagId) {
  console.log(`removing tag: ${tagId}`);
  try {
    const response = await fetch(`${apiUrl}/removeTagFromImage?tag_id=${tagId}&image_id=${props.id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      // TODO: implement displaying error to users
      throw new Error()
    }
    // tag successfully removed, update displayed list
    tags.value = tags.value.filter(tag => tag.tagId != tagId)
  } catch (err) {
    console.log('Could not remove tag', tagId)
  }
}
</script>

<style scoped>
.display-image {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

img {
  max-width: 100%;
  height: auto;
  margin-bottom: 1rem;
}

.error {
  color: red;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.add-tag-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0; /* Same as .tag background */
  border-radius: 20px;       /* Same pill shape */
  padding: 0.25rem 0.5rem;   /* Same inner spacing */
  margin: 0.25rem;           /* Space between tags */
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  height: auto;
  min-width: 30px;
}

.add-tag-button:hover {
  background-color: #d0d0d0; /* Slightly darker on hover */
}
</style>