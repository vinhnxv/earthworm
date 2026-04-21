<template>
  <div
    class="relative flex items-center justify-between border-t border-solid border-gray-300 pb-3 pt-4 text-base dark:border-gray-600"
  >
    <!-- Left side -->
    <div class="flex items-center">
      <NuxtLink
        class="clickable-item flex items-center justify-center"
        :href="`/course-pack/${courseStore.currentCourse?.coursePackId}`"
      >
        <UTooltip text="Course List">
          <IconsExpand class="h-7 w-7" />
        </UTooltip>
      </NuxtLink>
      <div
        class="clickable-item ml-4"
        @click="openCourseContents"
      >
        <UTooltip text="Lesson Questions">
          {{ currentCourseInfo }}
        </UTooltip>
      </div>
      <MainStudyVideoLink :video="courseStore.currentCourse?.video" />
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-4">
      <div
        @click="openGameSettingModal"
        v-if="isDictationMode()"
      >
        <UTooltip text="Game Settings">
          <UIcon
            name="i-ph-gear"
            class="clickable-item h-6 w-6"
          />
        </UTooltip>
      </div>

      <div
        v-if="isAuthenticated()"
        @click="pauseGame"
      >
        <UTooltip
          text="Pause Game"
          :shortcuts="parseShortcut(shortcutKeys.pause)"
        >
          <UIcon
            name="i-ph-pause"
            class="clickable-item h-6 w-6"
          />
        </UTooltip>
      </div>

      <div @click="handleDoAgain">
        <UTooltip text="Reset Current Lesson Progress">
          <UIcon
            name="i-ph-arrow-counter-clockwise"
            class="clickable-item h-6 w-6"
          />
        </UTooltip>
      </div>
      <div @click="rankingStore.showRankModal">
        <UTooltip text="Leaderboard">
          <UIcon
            name="i-ph-ranking"
            class="clickable-item h-6 w-6"
          />
        </UTooltip>
      </div>
    </div>

    <MainCourseContents v-model:isOpen="isOpenCourseContents"></MainCourseContents>
  </div>

  <CommonProgressBar
    class="h-6 p-[2px]"
    :percentage="currentPercentage"
  />
  <RankRankingBoard />
</template>

<script setup lang="ts">
import { useModal } from "#imports";
import { computed, ref } from "vue";

import Dialog from "~/components/common/Dialog.vue";
import { useQuestionInput } from "~/components/main/QuestionInput/questionInputHelper";
import { courseTimer } from "~/composables/courses/courseTimer";
import { useGameMode } from "~/composables/main/game";
import { clearQuestionInput } from "~/composables/main/question";
import { useCourseContents } from "~/composables/main/useCourseContents";
import { useGamePause } from "~/composables/main/useGamePause";
import { useGameSetting } from "~/composables/main/useGameSetting";
import { useRanking } from "~/composables/rank/rankingList";
import { useGamePlayMode } from "~/composables/user/gamePlayMode";
import { parseShortcut, useShortcutKeyMode } from "~/composables/user/shortcutKey";
import { isAuthenticated } from "~/services/auth";
import { useCourseStore } from "~/store/course";

const { shortcutKeys } = useShortcutKeyMode();
const { isDictationMode } = useGamePlayMode();
const rankingStore = useRanking();
const courseStore = useCourseStore();
const { focusInput } = useQuestionInput();
const { openCourseContents } = useCourseContents();
const { handleDoAgain } = useDoAgain();
const { pauseGame } = useGamePause();
const { openGameSettingModal } = useGameSetting();
const modal = useModal();

const currentCourseInfo = computed(() => {
  return `${courseStore.currentCourse?.title} (${currentSchedule.value}/${courseStore.visibleStatementsCount})`;
});

const currentSchedule = computed(() => {
  return courseStore.visibleStatementIndex + 1;
});

const currentPercentage = computed(() => {
  if (courseStore.isAllDone()) {
    return 100;
  }
  return ((courseStore.visibleStatementIndex / courseStore.visibleStatementsCount) * 100).toFixed(
    2,
  );
});

const isOpenCourseContents = ref(false);

function useDoAgain() {
  const { showQuestion } = useGameMode();

  function handleDoAgain() {
    modal.open(Dialog, {
      title: "Reset Progress",
      content: "Are you sure you want to reset the current lesson progress?",
      showCancel: true,
      showConfirm: true,
      async onCancel() {
        setTimeout(() => {
          focusInput();
        }, 300);
      },
      async onConfirm() {
        handleTipConfirm();
      },
    });
  }

  function handleTipConfirm() {
    courseStore.doAgain();
    clearQuestionInput();
    showQuestion();
    courseTimer.reset();
    // After the dialog closes, focus the input again. The close animation lasts 200 ms, so delay the focus.
    setTimeout(() => {
      focusInput();
    }, 300);
  }

  return {
    handleDoAgain,
    handleTipConfirm,
  };
}
</script>

<style scoped>
.clickable-item {
  @apply cursor-pointer select-none hover:text-fuchsia-500;
}
</style>
