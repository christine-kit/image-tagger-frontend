<template>
  <div class="tag-input-wrapper">
    <input
      type="text"
      v-model="inputValue"
      @input="onInput"
      @keydown.enter.prevent="onEnter"
      @keydown.esc="onCancel"
      @blur="onBlur"
      ref="inputRef"
      placeholder="Add a tag..."
    />
    <ul v-if="suggestions.length > 0" class="autocomplete-list">
      <li
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const emit = defineEmits(['addTag', 'cancel', 'blurred']);

const props = defineProps({
  initialValue: {
    type: String,
    default: ''
  }
})
const inputValue = ref(props.initialValue)
const suggestions = ref([]);
const inputRef = ref(null);
const tagPending = ref(false)

let debounceTimeout = null;

// Focus the input when component is mounted
nextTick(() => {
  inputRef.value.focus();
});

const onInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(async () => {
    if (inputValue.value.trim() === '') {
      suggestions.value = [];
      return;
    }

    // Placeholder autocomplete API call
    // TODO: Replace with actual API implementation
    /*
    try {

      const response = await fetch(`/api/autocompleteTag?input=${encodeURIComponent(inputValue.value)}`);
      if (response.ok) {
        suggestions.value = await response.json();
      } else {
        suggestions.value = [];
      }
    } catch (error) {
      console.error('Autocomplete failed', error);
      suggestions.value = [];
    }*/
   suggestions.value = ['placeholder1', 'placeholder2']
  }, 300); // 300ms debounce
};

const onEnter = async () => {
  const tag = inputValue.value.trim();
  if (tag === '') return;

  let tagExists = false
  tagPending.value = true

  // check if tag exists
  try {
    const response = await fetch(`/api/getTag?id=${encodeURIComponent(tag)}`);
    if (response.ok) {
      tagExists = true;
    } else if (response.status === 500) {
      // TODO: display server error to user
      console.error('Server error while verifying tag:',await response.text());
      return;
    }
  } catch (error) {
    console.error('Could not verify tag:', error);
    return;
  }

  // create new tag if tag doesn't exist
  if (!tagExists) {
    try {
      const response = await fetch('/api/newTag', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          tag_name: tag,
          tag_type: 'general'
        })
      })
      if (!response.ok) {
        console.error('Server error while creating new tag:', await response.text())
        return;
      }
      console.log(`new tag ${tag} created`)
    } catch (error) {
      console.error('Could not add new tag:', error)
      return;
    }
  }

  // tag verified to exist, emit to parent page to add tag to image
  emit('addTag', tag)
};

// TODO: implement this
const selectSuggestion = (tag) => {
  inputValue.value = '';
  suggestions.value = [];
};

const onCancel = () => {
  emit('cancel');
  inputValue.value = '';
  suggestions.value = [];
};

function onBlur() {
  emit('blurred', inputValue.value)
}
</script>

<style scoped>
.tag-input-wrapper {
  position: relative;
  display: inline-block;
}

input[type="text"] {
  padding: 5px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 200px;
}

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  list-style: none;
  padding: 0;
  width: 200px;
  z-index: 10;
}

.autocomplete-list li {
  padding: 8px 10px;
  cursor: pointer;
}

.autocomplete-list li:hover {
  background-color: #f0f0f0;
}
</style>
