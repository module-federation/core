<template>
  <div class="vue-remote-home">
    <h2>Vue Remote Home</h2>
    <p class="vue-remote-test">test prop: {{ test }}</p>
    <button class="vue-remote-counter" @click="count++">
      Count: {{ count }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

defineProps<{ test?: string }>();
const count = ref(0);
</script>
