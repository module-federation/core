<template>
  <div>
    <h3>Vue3 app</h3>
    <router-link to="/" class="self-remote3-home-link">Home</router-link>
    <span> | </span>
    <router-link to="/detail" class="self-remote3-detail-link"
      >Detail</router-link
    >
    <router-view></router-view>
  </div>
</template>

<style scoped></style>

<script lang="ts" setup>
interface Props {
  test?: string;
}

const props = defineProps<Props>();
console.log('props', props);
</script>
