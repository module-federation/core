<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { RemoteReactApp } from './remoteApps';
import type { HostSSRContext } from './ssrContext';

const props = defineProps<{ ssrContext?: HostSSRContext }>();
const route = useRoute();
const locationUrl = computed(
  () =>
    `${route.path}${route.fullPath.includes('?') ? `?${route.fullPath.split('?')[1]}` : ''}`,
);
const activeContext = computed(() => {
  const seedPath = props.ssrContext?.url.split('?')[0].split('#')[0];
  return seedPath === route.path ? props.ssrContext : undefined;
});
</script>

<template>
  <div class="bridge-ssr-host bridge-ssr-vue-host" :data-location="locationUrl">
    <nav>
      <RouterLink to="/">Home</RouterLink> |
      <RouterLink class="host-react-remote-link" to="/react-remote"
        >React Remote</RouterLink
      >
      |
      <RouterLink to="/react-pair">React Pair</RouterLink>
    </nav>

    <main v-if="route.path.startsWith('/react-pair')">
      <h2>React Remote Pair</h2>
      <RemoteReactApp
        module-name="bridge_ssr_react"
        basename="/react-pair"
        name="Left"
        :age="1"
        :ssr="activeContext?.reactPair?.[0]"
        :instance-id="activeContext?.reactPair?.[0]?.instanceId"
      />
      <RemoteReactApp
        module-name="bridge_ssr_react"
        basename="/react-pair"
        name="Right"
        :age="2"
        :ssr="activeContext?.reactPair?.[1]"
        :instance-id="activeContext?.reactPair?.[1]?.instanceId"
      />
    </main>
    <main v-else-if="route.path.startsWith('/react-remote')">
      <h2>React Remote</h2>
      <RemoteReactApp
        module-name="bridge_ssr_react"
        basename="/react-remote"
        name="Ming"
        :age="12"
        :ssr="activeContext?.reactRemote"
        :instance-id="activeContext?.reactRemote?.instanceId"
      />
    </main>
    <main v-else>
      <h1>Bridge SSR Host</h1>
      <p>Vue outer host consuming a React application remote.</p>
    </main>
  </div>
</template>
