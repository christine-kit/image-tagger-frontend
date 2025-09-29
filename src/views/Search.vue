<template>
  <h1>Search</h1>
  <div class="search-page">
    <div class="search-bar">
      <Tag
        v-for="(tag, index) in inputTags"
        :key="index"
        :tagId="tag"
        @removeTag="handleRemoveTag"
      />
      <input
        v-model="inputValue"
        @keydown.enter.prevent="addTag"
        @keydown.space.prevent="addTag"
        @keydown.backspace="handleBackspace"
        :placeholder="inputTags.length === 0 && inputValue === '' ? 'Type a tag, or hit search for untagged images' : ''"
        class="tag-input"
      />
    </div>

    <button @click="handleSearch" class="search-button">
      Search
    </button>

    <ImageList :imageList="imageIds"/>
  </div>
</template>

<script setup>
/*
Function flow:
- on mount, if there are query tags, populate the search field with those tags
- on search button, push tags to query params, then fetch images from API
*/
import { onMounted, ref } from 'vue'
import Tag from '@/components/Tag.vue'
import ImageList from '@/components/ImageList.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const inputValue = ref('')
const inputTags = ref([])
const imageIds = ref([])
const apiUrl = import.meta.env.VITE_API_URL

// if there are tags in query params, populate input field with those tags,
// then fetch images
onMounted(() => {
  getTagsFromQuery()
  if (inputTags.value.length > 0) {
    fetchImages(inputTags.value)
  }
})

function getTagsFromQuery() {
  const queryTags = route.query.tags
  // ensure tagList is an array, handling case for string and null
  const tagList = Array.isArray(queryTags)
    ? queryTags
    : queryTags
    ? [queryTags]
    : []
  inputTags.value = tagList
}

function addTag() {
  const trimmed = inputValue.value.trim()
  if (trimmed && !inputTags.value.includes(trimmed)) {
    inputTags.value.push(trimmed)
  }
  inputValue.value = ''
}

function handleRemoveTag(tagId) {
  inputTags.value = inputTags.value.filter(t => t !== tagId)
}

function handleBackspace() {
  if (inputValue.value !== '') {
    return
  }
  let len = inputTags.value.length
  if (len == 0) {
    return
  }
  let tag = inputTags.value[len - 1]
  inputValue.value = tag
  inputTags.value.pop()
}

function handleSearch() {
  imageIds.value = []
  if (inputTags.value.length === 0) {
    fetchUntaggedImages();
    return;
  }
  router.push({
    path:'/search',
    query: {tags: inputTags.value}
  })
  fetchImages(inputTags.value)
}

async function fetchUntaggedImages() {
  console.log("fetching untagged images");
  try {
    const response = await fetch(
      `${apiUrl}/getUntaggedImages`,
      {
        method: 'GET'
      }
    );
    imageIds.value = await response.json()
    console.log(imageIds.value)
  } catch (err) {
    console.error('Could not fetch untagged images', err)
  }
}

// query for images by list of tags, populate imageIds list with results
async function fetchImages(tagList) {
  if (tagList.length == 0) {
    return
  }
  const queryString = tagList
    .map(t => `tags=${encodeURIComponent(t)}`)
    .join('&')
  const url = `${apiUrl}/queryImagesByTag?${queryString}`
  try {
    console.log('querying images by tags')
    const response = await fetch(url, {
      method: 'GET'
    })
    imageIds.value = await response.json()
    console.log('image ids fetched')
  } catch (err) {
    console.error('Could not fetch image ids', err)
  }
}
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Search bar container with wrapping */
.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  gap: 0.25rem;
}

/* Input styled to blend with inputTags */
.tag-input {
  border: none;
  outline: none;
  font-size: 1rem;
  min-width: 100px;
  flex: 1;
}

.search-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

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
  max-width: 100%;
  border-radius: 8px;
}

.image-name {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.25rem;
  text-decoration: none;
}
</style>