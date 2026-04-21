<template>
  <UModal
    v-model="showGamePauseModal"
    @close="handleClose"
    :ui="{ width: 'w-full sm:max-w-lg' }"
  >
    <div
      class="flex min-h-60 flex-col justify-between px-8 py-7 text-gray-900 dark:text-white sm:px-9 sm:py-8"
    >
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Game Paused</h2>
        <p class="max-w-md text-base leading-8 text-gray-700 dark:text-gray-300">
          {{ randomMessage }}
        </p>
      </div>
      <div class="flex w-full justify-end">
        <UButton
          class="px-6 py-2"
          @click="handleClose"
        >
          Continue
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useQuestionInput } from "~/components/main/QuestionInput/questionInputHelper";
import { useGamePause } from "~/composables/main/useGamePause";
import { useShortcutKeyMode } from "~/composables/user/shortcutKey";
import { useGameStore } from "~/store/game";
import { cancelShortcut, registerShortcut } from "~/utils/keyboardShortcuts";

const gameStore = useGameStore();
const { showGamePauseModal, resumeGame, pauseGame } = useGamePause();
const { shortcutKeys } = useShortcutKeyMode();
const { focusInput } = useQuestionInput();

const messages = [
  "Do not forget to come back and keep practicing. I will be waiting for you!",
  "Taking a break is fine, just do not keep me waiting too long!",
  "Come back soon. Your English skills are getting ready to level up!",
];

const randomMessage = ref("");
watch(
  showGamePauseModal,
  (newValue) => {
    if (newValue) {
      randomMessage.value = messages[Math.floor(Math.random() * messages.length)];
    }
  },
  {
    immediate: true,
  },
);

function handleClose() {
  resumeGame();
  setTimeout(() => {
    focusInput();
  }, 300);
}

function handleGamePause(e: KeyboardEvent) {
  e.preventDefault();
  if (gameStore.isGamePaused()) {
    resumeGame();
    setTimeout(() => {
      focusInput();
    }, 300);
  } else {
    pauseGame();
  }
}

onMounted(() => {
  registerShortcut(shortcutKeys.value.pause, handleGamePause);
});

onUnmounted(() => {
  cancelShortcut(shortcutKeys.value.pause, handleGamePause);
});
</script>
