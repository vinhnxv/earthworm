<template>
  <UModal
    v-model="showModal"
    prevent-close
  >
    <UContainer
      :ui="{
        base: 'w-[90vw]',
        constrained: 'max-w-[780px]',
      }"
    >
      <div class="flex justify-between">
        <h3 className="font-bold text-lg mb-4">🎉 {{ $t("game.summary.congrats") }}</h3>
        <button
          tabindex="0"
          class="btn btn-ghost btn-sm mx-1 h-7 w-7 rounded-md p-0"
          @click="soundSentence"
        >
          <UIcon
            name="i-ph-speaker-simple-high"
            class="h-full w-full"
          ></UIcon>
        </button>
      </div>

      <div class="flex flex-col">
        <div class="flex">
          <span class="text-3xl font-bold sm:text-4xl lg:text-6xl">"</span>
          <div class="flex-1 text-center text-sm leading-loose sm:text-base lg:text-xl">
            {{ enSentence }}
          </div>
          <span class="invisible text-3xl font-bold sm:text-4xl lg:text-6xl">"</span>
        </div>

        <div class="flex">
          <span class="invisible text-3xl font-bold sm:text-4xl lg:text-6xl">"</span>
          <div class="flex-1 text-center text-sm leading-loose sm:text-base lg:text-xl">
            {{ zhSentence }}
          </div>
          <span class="text-3xl font-bold sm:text-4xl lg:text-6xl">"</span>
        </div>
        <p class="text-right text-xs text-gray-200 sm:text-sm">
          {{ $t("game.summary.dailyQuote") }}
        </p>
        <p
          class="pl-2 text-xs leading-loose text-gray-600 sm:pl-4 sm:text-sm lg:pl-14 lg:text-base"
        >
          {{
            $t("game.summary.completed", {
              count: courseTimer.totalRecordNumber(),
              time: formatSecondsToTime(courseTimer.calculateTotalTime()),
            })
          }}
        </p>
        <p
          v-if="isAuthenticated()"
          class="pl-2 text-xs leading-loose text-gray-400 sm:pl-4 sm:text-sm lg:pl-14 lg:text-base"
        >
          {{ $t("game.summary.todayLearning", { minutes: formattedMinutes }) }}
          <span v-if="totalMinutes >= 30">{{ $t("game.summary.encouragement") }} 😄</span>
        </p>
      </div>
      <div className="modal-action flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
        <button
          class="btn btn-primary w-full sm:w-auto"
          @click="toShare"
        >
          {{ $t("game.summary.generateImage") }}
        </button>
        <button
          class="btn w-full sm:w-auto"
          @click="handleDoAgain"
        >
          {{ $t("game.summary.retry") }}
        </button>
        <button
          class="btn w-full sm:w-auto"
          @click="handleGoToCourseList"
        >
          {{ $t("game.summary.courseList") }}
        </button>
        <button
          class="btn w-full sm:w-auto"
          @click="goToNextCourse"
        >
          {{ $t("game.summary.nextCourse") }}
          <UKbd> ↵ </UKbd>
        </button>
      </div>
    </UContainer>
  </UModal>

  <canvas
    ref="confettiCanvasRef"
    class="pointer-events-none absolute left-0 top-0 z-[1000] h-full w-full"
  ></canvas>
</template>

<script setup lang="ts">
import { useI18n, useModal } from "#imports";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import Dialog from "~/components/common/Dialog.vue";
import { useActiveCourseMap } from "~/composables/courses/activeCourse";
import { courseTimer } from "~/composables/courses/courseTimer";
import { useConfetti } from "~/composables/main/confetti/useConfetti";
import { readOneSentencePerDayAloud } from "~/composables/main/englishSound";
import { useGameMode } from "~/composables/main/game";
import { useLearningTimeTracker } from "~/composables/main/learningTimeTracker";
import { useShareModal } from "~/composables/main/shareImage/share";
import { useDailySentence, useSummary } from "~/composables/main/summary";
import { useNavigation } from "~/composables/useNavigation";
import { isAuthenticated, signIn } from "~/services/auth";
import { useCourseStore } from "~/store/course";
import { useCoursePackStore } from "~/store/coursePack";
import { useGameStore } from "~/store/game";
import { permitSaveStatement, preventSaveStatement } from "~/store/statement";
import { formatSecondsToTime } from "~/utils/date";
import { cancelShortcut, registerShortcut } from "~/utils/keyboardShortcuts";

const { t } = useI18n();

const courseStore = useCourseStore();
const coursePackStore = useCoursePackStore();
const { gotoCourseList, gotoGame } = useNavigation();
const { showQuestion } = useGameMode();
const { handleGoToCourseList, goToNextCourse, completeCourse } = useCourse();
const { handleDoAgain } = useDoAgain();
const { showModal, hideSummary } = useSummary();
const { zhSentence, enSentence } = useDailySentence();
const { confettiCanvasRef, playConfetti } = useConfetti();
const { showShareModal } = useShareModal();
const { updateActiveCourseMap } = useActiveCourseMap();
const { totalMinutes, formattedMinutes } = useTotalLearningTime();

const gameStore = useGameStore();
const modal = useModal();

watch(showModal, (val) => {
  if (val) {
    // Prevent auto-advancing to the next lesson after finishing a course with statements
    // This avoids updating statement progress after the next lesson has already been set
    // Otherwise the most recent course-pack progress becomes incorrect because it is time-based
    preventSaveStatement();
    // Register Enter to go to the next lesson
    registerShortcut("enter", goToNextCourse);
    // Showing the summary panel means the current lesson is complete
    completeCourse();
    // Read the sentence of the day aloud
    soundSentence();
    // Wait a little before showing the easter egg
    // Stop the timer
    gameStore.completeLevel();
    setTimeout(async () => {
      playConfetti();
    }, 300);
  } else {
    // Unregister Enter for moving to the next lesson
    cancelShortcut("enter", goToNextCourse);
    permitSaveStatement();
  }
});

function useTotalLearningTime() {
  const { totalSeconds } = useLearningTimeTracker();
  const totalMinutes = computed(() => Math.ceil(totalSeconds.value / 60));

  const formattedMinutes = computed(() => {
    return Math.max(totalMinutes.value, 1).toString();
  });

  return {
    totalMinutes,
    formattedMinutes,
  };
}

function useDoAgain() {
  async function handleDoAgain() {
    // Check whether everything has not been mastered yet
    // If everything is mastered, show a notice and jump to the course list
    if (courseStore.isAllMastered()) {
      toast.info(t("game.progress.allMastered"), {
        duration: 1500,
        onAutoClose: () => {
          handleGoToCourseList();
        },
      });
      return;
    }
    courseStore.doAgain();
    hideSummary();
    showQuestion();
    courseTimer.reset();
    gameStore.startGame();
  }

  return {
    handleDoAgain,
  };
}

// Read the sentence of the day aloud
function soundSentence() {
  readOneSentencePerDayAloud(enSentence.value);
}

function useCourse() {
  let nextCourseId = ref("");

  const haveNextCourse = computed(() => {
    return nextCourseId.value;
  });

  async function goToNextCourse() {
    if (!isAuthenticated()) {
      // Go sign up
      modal.open(Dialog, {
        title: t("game.summary.unlockTitle"),
        content: t("game.summary.unlockContent"),
        showCancel: true,
        showConfirm: true,
        cancelText: t("game.summary.later"),
        confirmText: t("game.summary.registerNow"),
        async onConfirm() {
          courseStore.resetStatementIndex();
          showQuestion();
          signIn();
        },
      });

      return;
    }

    hideSummary();

    if (!haveNextCourse.value) {
      toast.info(t("game.progress.lastCourse"), {
        duration: 1500,
        onAutoClose: () => {
          handleGoToCourseList();
        },
      });
      return;
    }

    if (courseStore.currentCourse) {
      gotoGame(courseStore.currentCourse.coursePackId, nextCourseId.value);
    }
  }

  function handleGoToCourseList() {
    hideSummary();
    if (courseStore.currentCourse) {
      gotoCourseList(courseStore.currentCourse.coursePackId);
    }
  }

  async function completeCourse() {
    if (isAuthenticated() && courseStore.currentCourse) {
      const { coursePackId } = courseStore.currentCourse;
      const { nextCourse } = await courseStore.completeCourse();
      coursePackStore.updateCoursesCompleteCount(coursePackId);

      if (nextCourse) {
        nextCourseId.value = nextCourse.id;
        updateActiveCourseMap(coursePackId, nextCourseId.value);
      } else {
        updateActiveCourseMap(coursePackId, "");
      }
    }
  }

  return {
    completeCourse,
    goToNextCourse,
    handleGoToCourseList,
  };
}

const toShare = () => {
  showShareModal();
};
</script>
