<template>
  <div class="display-image" >
    <div class="image-header">
      <h1>
        <span v-if="imageData?.image_name && imageData.image_name.trim()">
          {{ imageData.image_name }}
        </span>
        <span v-else class="placeholder">(no image name)</span>
      </h1>
      <button class="delete-button" @click="showConfirm = true">Delete Image</button>
    </div>

    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>Are you sure you want to delete this image?</p>
        <button @click="confirmDelete">Yes, delete</button>
        <button @click="showConfirm = false">Cancel</button>
      </div>
    </div>

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

      
      <p>
        <span v-if="imageData?.description && imageData.description.trim()">
          {{ imageData.description}}
        </span>
        <span v-else class="placeholder">(no description)</span>
      </p>
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
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

import Tag from '@/components/Tag.vue'
import TagInput from '@/components/TagInput.vue'
import { nextTick } from 'vue'

const router = useRouter()
const props = defineProps({
  id: String
})
const toast = inject('toast');

const imageData = ref({});
const error = ref(null);
const loading = ref(true);
const imageLoadError = ref(false);
const tags = ref([]);
const isAddingTag = ref(false);
const savedInputText = ref('');
const showConfirm = ref(false)
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
    toast('Failed to fetch tags', 'error')
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
    if (!data[0]) {
      throw new Error(`Image with id ${props.id} does not exist`);
    }
    imageData.value = data[0];
  } catch (err) {
    imageLoadError.value = true;
    error.value = err.message;
    toast('Failed fetch image', 'error')
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  try {
    const response = await fetch(`/api/deleteImage?id=${props.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      console.log('Image deleted');
      toast('Image deleted successfully');
      router.push('/');
    } else {
      console.error('Delete failed');
    }
  } catch (error) {
    console.error('Error deleting image', error);
    toast('Error deleting image', 'error')
  } finally {
    showConfirm.value = false;
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
    toast('Failed to add tag to image', 'error')
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
    toast(`Failed to remove tag ${tagId}`, 'error')
  }
}
</script>

<style scoped>
.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.placeholder {
  color: gray;
  font-weight: normal;
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

/* Confirmation popup styles */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>