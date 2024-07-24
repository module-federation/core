<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<template>
  <button class="greetings">
    {{ msg }}
  </button>
</template>
