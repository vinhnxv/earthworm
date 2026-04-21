<template>
  <UModal
    v-model="showModal"
    @close="handleCloseDialog"
  >
    <UContainer>
      <h3 class="mb-4 text-center text-base font-bold">
        Press a key or key combination first, then press Enter ⏎ to confirm
      </h3>
      <div class="h-8 rounded border border-solid text-center leading-8">
        {{ shortcutKeyStr }}
      </div>
      <div class="mt-2 flex h-8 justify-center gap-0.5 text-center">
        <div v-if="shortcutKeyTip">
          <UKbd v-for="key in parseShortcutKeys(shortcutKeyTip)">
            {{ key }}
          </UKbd>
        </div>
      </div>
      <div
        v-if="hasSameShortcutKey"
        class="mt-4 text-center text-xs"
        :class="'text-[rgba(136,136,136,1)]'"
      >
        This key binding already exists. Please choose another one.
      </div>
    </UContainer>
  </UModal>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import { useShortcutKeyMode } from "~/composables/user/shortcutKey";
import { parseShortcutKeys } from "~/utils/keyboardShortcuts";

const {
  showModal,
  shortcutKeyStr,
  shortcutKeyTip,
  hasSameShortcutKey,
  handleCloseDialog,
  handleKeydown,
} = useShortcutKeyMode();

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped></style>
