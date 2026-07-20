<template>
  <div>
    <h3 class="vue-remote-title">Vue3 Remote App</h3>
    <router-link to="/" class="vue-remote-home-link">Home</router-link>
    <span> | </span>
    <router-link to="/detail" class="vue-remote-detail-link"
      >Detail</router-link
    >
    <router-view v-bind="forwardedProps"></router-view>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  test?: string;
}

const props = defineProps<Props>();
const forwardedProps = props;
</script>
