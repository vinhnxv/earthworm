<template>
  <div class="text-center">
    <div class="relative flex flex-wrap justify-center gap-2 transition-all">
      <template
        v-for="(w, i) in courseStore.words"
        :key="i"
      >
        <div
          v-if="isWord(w)"
          class="h-[4rem] rounded-[2px] border-b-2 border-solid text-[3em] leading-none transition-all"
          :class="getWordsClassNames(i)"
          :style="{ minWidth: `${inputWidth(w)}ch` }"
        >
          {{ findWordById(i)!.userInput }}
        </div>
        <div
          v-else
          class="h-[4rem] rounded-[2px] text-[3em] leading-none transition-all"
        >
          {{ w }}
        </div>
      </template>
      <input
        lang="en"
        ref="inputEl"
        class="absolute h-full w-full opacity-0"
        type="text"
        v-model="inputValue"
        @keydown="handleKeydown"
        @focus="focusInput"
        @blur="blurInput"
        @dblclick.prevent
        @mousedown="preventCursorMove"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        autoFocus
      />
    </div>
    <div class="mt-12 flex flex-col items-center justify-center gap-4 md:hidden">
      <button
        class="btn btn-outline btn-sm"
        @click="handleSubmitAnswer"
      >
        Submit
      </button>
      <div class="flex gap-4">
        <button
          class="btn btn-outline btn-sm"
          @click="handleShowAnswerTip"
        >
          {{ isAnswerTip() ? "Hide Answer" : "Show Answer" }}
        </button>
        <button
          class="btn btn-outline btn-sm"
          @click="handlePlaySound"
        >
          Play Audio
        </button>
      </div>
      <MainMasteredBtn></MainMasteredBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { courseTimer } from "~/composables/courses/courseTimer";
import { useAnswerTip } from "~/composables/main/answerTip";
import { useCurrentStatementEnglishSound } from "~/composables/main/englishSound";
import { isWord } from "~/composables/main/question";
import { useShowWordsWidth } from "~/composables/user/words";
import { useCourseStore } from "~/store/course";
import { isWindows } from "~/utils/platform";
import { getWordWidth, useQuestionInput } from "./questionInputHelper";
import { useAnswerError } from "./useAnswerError";
import { useWrapperQuestionInput } from "./useWrapperQuestionInput";

const courseStore = useCourseStore();
const { inputEl, focusing, focusInput, blurInput } = useQuestionInput();
const {
  initializeQuestionInput,
  findWordById,
  isFixMode,
  inputValue,
  submitAnswer,
  handleKeyboardInput,
  setInputValue,
} = useWrapperQuestionInput();
const { isShowWordsWidth } = useShowWordsWidth();
const { toggleAnswerTip, isAnswerTip } = useAnswerTip();
const { resetCloseTip } = useAnswerError();
initializeQuestionInput();
focusInputWhenWIndowFocus();

onMounted(() => {
  focusInput();
  resetCloseTip();
});

watch(
  () => inputValue.value,
  (val) => {
    setInputValue(val);
    courseTimer.time(String(courseStore.statementIndex));
  },
);

watch(
  () => courseStore.statementIndex,
  () => {
    focusInput();
    resetCloseTip();
  },
);

function focusInputWhenWIndowFocus() {
  const handleFocus = () => {
    focusInput();
  };

  onMounted(() => {
    window.addEventListener("focus", handleFocus);
  });

  onUnmounted(() => {
    window.removeEventListener("focus", handleFocus);
  });
}

const { playSound } = useCurrentStatementEnglishSound();
function handlePlaySound(e: MouseEvent) {
  e.preventDefault();
  playSound();
}

function handleShowAnswerTip(e: MouseEvent) {
  e.preventDefault();
  toggleAnswerTip();
}

function handleSubmitAnswer() {
  submitAnswer();
}

function getWordsClassNames(index: number) {
  const word = findWordById(index)!;
  // Current word is active and focused
  if (word.isActive && focusing.value) {
    return "text-fuchsia-500 border-b-fuchsia-500";
  }

  // Current word is incorrect and focused
  if (word.incorrect && focusing.value) {
    // Add animation in fix mode
    return `text-red-500 border-b-red-500 ${isFixMode() && "animate-shake"}`;
  }

  // Default style
  return "text-[#20202099] border-b-gray-300 dark:text-gray-300 dark:border-b-gray-400";
}

// Input width
function inputWidth(word: string) {
  if (!isShowWordsWidth()) {
    // If word width is hidden, use a default width of 4 characters
    return 4;
  }

  return getWordWidth(word);
}

// Chinese IME input can trigger handleKeydown first
// but the composed character has not been inserted yet
// which can trigger submitAnswer and reject a correct answer by mistake
// Detect IME composition to avoid submitting immediately when Enter is pressed
let isComposing = ref(false);
function handleCompositionStart() {
  isComposing.value = true;
}

function handleCompositionEnd() {
  isComposing.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  // Add Ctrl+Backspace on Windows to delete the previous word
  // Some browsers do not support Ctrl+Backspace in inputs, so extend it manually here
  if (e.code === "Backspace" && e.ctrlKey && isWindows()) {
    e.preventDefault();
    deletePreviousWordOnWin();
    return;
  }

  // Prevent some Chinese IMEs from committing the current composing text when Ctrl is pressed
  if (e.ctrlKey) {
    e.preventDefault();
    return;
  }

  if (e.code === "Enter" && !isComposing.value) {
    e.stopPropagation();
    submitAnswer();
    return;
  }

  handleKeyboardInput(e);
}

function deletePreviousWordOnWin() {
  var start = inputEl.value!.selectionStart!;
  var end = inputEl.value!.selectionEnd!;
  if (end === 0) return;

  // Delete all consecutive spaces before the cursor
  while (start > 0 && inputValue.value[start - 1] === " ") {
    start--;
  }
  var valueToCursor = inputValue.value.substring(0, start);
  var newEnd = valueToCursor.lastIndexOf(" ") + 1 || 0;
  inputValue.value = inputValue.value.substring(0, newEnd);
  inputEl.value!.setSelectionRange(newEnd, newEnd);
}

function preventCursorMove(event: MouseEvent) {
  // Prevent the default mousedown behavior
  // It changes the input cursor position
  event.preventDefault();
  // Only allow the input to receive focus
  focusInput();
}
</script>
