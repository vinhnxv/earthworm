<template>
  <div class="relative flex h-32 items-center justify-center">
    <div class="z-10 hidden items-center justify-center min-[780px]:flex">
      <button
        v-for="keybinding in keybindings"
        @click="keybinding.eventFn"
        class="btn btn-ghost"
      >
        <div class="flex items-center gap-0.5">
          <UKbd v-for="keyStr in parseShortcutKeys(keybinding.keys)">
            {{ keyStr }}
          </UKbd>
        </div>
        <span>{{ keybinding.text }}</span>
      </button>
    </div>

    <MainPrevAndNextBtn />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";

import { useAnswerTip } from "~/composables/main/answerTip";
import { useCurrentStatementEnglishSound } from "~/composables/main/englishSound";
import { useGameMode } from "~/composables/main/game";
import { useSummary } from "~/composables/main/summary";
import { useMastered } from "~/composables/main/useMastered";
import { useShortcutKeyMode } from "~/composables/user/shortcutKey";
import { cancelShortcut, parseShortcutKeys, registerShortcut } from "~/utils/keyboardShortcuts";
import { useAnswer } from "./QuestionInput/useAnswer";
import { useWrapperQuestionInput } from "./QuestionInput/useWrapperQuestionInput";

const { toggleAnswerTip, isAnswerTip } = useAnswerTip();
const { shortcutKeys } = useShortcutKeyMode();
const { playSound } = usePlaySound(shortcutKeys.value.sound);
const { goToNextQuestion } = useAnswer();
const { showQuestion, isQuestion } = useGameMode();
const { submitAnswer } = useWrapperQuestionInput();
const { handleMastered } = useMasteredShortcut();
useShowAnswer(shortcutKeys.value.answer);

const keybindings = computed(() => {
  const questionItems = [
    {
      keys: "Enter",
      text: "Submit",
      eventFn: () => {
        submitAnswer();
      },
    },
    {
      keys: shortcutKeys.value.answer,
      text: isAnswerTip() ? "Hide Answer" : "Show Answer",
      eventFn: () => {
        toggleAnswerTip();
      },
    },
  ];

  const answerItems = [
    {
      keys: "Enter",
      text: "Next",
      eventFn: () => {
        goToNextQuestion();
      },
    },
    {
      keys: shortcutKeys.value.answer,
      text: "Try Again",
      eventFn: () => {
        showQuestion();
      },
    },
  ];

  const normalItems = [
    {
      keys: shortcutKeys.value.sound,
      text: "Play Audio",
      eventFn: playSound,
    },
    {
      keys: shortcutKeys.value.mastered,
      text: "Mastered",
      eventFn: handleMastered,
    },
  ];

  const resultItems: any = [...normalItems];

  if (isQuestion()) {
    resultItems.push(...questionItems);
  } else {
    resultItems.push(...answerItems);
  }

  return resultItems;
});

function useMasteredShortcut() {
  const { markStatementAsMastered } = useMastered();

  function handleMastered() {
    markStatementAsMastered();
  }

  onMounted(() => {
    registerShortcut(shortcutKeys.value.mastered, handleMastered);
  });

  onUnmounted(() => {
    cancelShortcut(shortcutKeys.value.mastered, handleMastered);
  });

  return {
    handleMastered,
  };
}

function usePlaySound(key: string) {
  const { playSound } = useCurrentStatementEnglishSound();

  onMounted(() => {
    registerShortcut(key, playSoundCommand);
  });

  onUnmounted(() => {
    cancelShortcut(key, playSoundCommand);
  });

  function playSoundCommand(e: KeyboardEvent) {
    e.preventDefault();
    playSound();
  }

  return {
    playSound,
  };
}

function useShowAnswer(key: string) {
  onMounted(() => {
    registerShortcut(key, handleShowAnswer);
  });

  onUnmounted(() => {
    cancelShortcut(key, handleShowAnswer);
  });

  function handleShowAnswer(e: KeyboardEvent) {
    e.preventDefault();
    // NOTE: registerShortcut remembers the panel state at registration time, so read the panel state again here
    const { showModal } = useSummary();
    if (showModal.value) return;

    const { isAnswer } = useGameMode();
    if (isAnswer()) {
      showQuestion();
    } else {
      toggleAnswerTip();
    }
  }
}
</script>
