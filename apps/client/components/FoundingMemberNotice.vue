<template>
  <div
    class="w-full rounded-lg bg-purple-600 px-4 py-1 text-white"
    v-if="showNotice"
  >
    <div class="flex items-center justify-between">
      <div class="font-bold">
        [Invitation] Join Earthworm Founding Members and help us build a better English learning
        platform
      </div>
      <div class="hidden sm:flex sm:space-x-4">
        <button
          class="text-black"
          @click="dismissNotice"
        >
          Not interested
        </button>
        <button
          class="rounded-lg bg-white px-4 font-bold text-purple-600"
          @click="handleShowDetails"
        >
          View details
        </button>
      </div>
    </div>
    <div class="flex items-center justify-center gap-8 sm:hidden">
      <button
        class="text-black"
        @click="dismissNotice"
      >
        Not interested
      </button>
      <button
        class="rounded-lg bg-white px-4 font-bold text-purple-600"
        @click="handleShowDetails"
      >
        View details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";

import { useUserStore } from "~/store/user";

const showNotice = ref(false);
const userStore = useUserStore();

onMounted(() => {
  showNotice.value = shouldShowNotice();
});

watchEffect(() => {
  showNotice.value = !userStore.isFounderMembership();
});

function dismissNotice() {
  setNoticeDismissed();
  showNotice.value = false;
}

function handleShowDetails() {
  window.open("https://earthworm-docs.cuixueshe.com/get-started/founding-member.html", "_blank");
}

function setNoticeDismissed(): void {
  const expirationTime = Date.now() + 48 * 60 * 60 * 1000; // Timestamp 48 hours from now
  localStorage.setItem("noticeDismissed", expirationTime.toString());
}

function shouldShowNotice(): boolean {
  if (userStore.isFounderMembership()) return false;

  const dismissedTime = localStorage.getItem("noticeDismissed");
  if (!dismissedTime) return true;

  const currentTime = Date.now();
  return currentTime > parseInt(dismissedTime);
}
</script>

<style scoped></style>
