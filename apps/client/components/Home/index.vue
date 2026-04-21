<template>
  <div class="mt-8 flex w-full justify-between">
    <!-- Left avatar section -->
    <div class="mr-16 hidden w-72 md:block">
      <div
        class="mx-auto h-56 w-56 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700"
      >
        <!-- Stretch the image to fit the fixed height. If the image is missing or fails to load, show the outer background color instead. -->
        <img
          class="h-full object-cover"
          :src="userStore.user?.avatar"
        />
      </div>
      <div class="mt-4 truncate">
        <div class="flex gap-2">
          <div class="text-3xl font-medium">{{ userStore.user?.username }}</div>
          <MembershipBadge></MembershipBadge>
        </div>
        <div class="text-md text-gray-400">
          {{ userStore.user?.name }}
        </div>
      </div>
      <hr class="my-5 dark:border-gray-700" />
      <!-- TODO: show badges after they are ready -->
      <!-- <div class="text-lg font-medium">Badges</div>
      <div class="mt-2 grid grid-cols-4 gap-2">
        <div
          v-for="i in 6"
          class="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700"
        ></div>
      </div> -->
    </div>

    <!-- Right course pack section -->
    <div class="min-w-0 flex-1">
      <div class="mb-4 flex justify-between border-b pb-2 dark:border-gray-700">
        <div class="text-xl font-medium">Recently Used Course Packs</div>
        <NuxtLink
          href="/course-pack"
          class="link text-blue-500 no-underline hover:opacity-75"
          >More Course Packs
        </NuxtLink>
      </div>
      <HomeRecentCoursePack />
      <HomeCalendarGraph
        class="mt-10"
        :data="learningDailyTimeList"
        :totalLearningTime="learningDailyTotalTime"
        @toggleYear="toggleYear"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAsyncData } from "#imports";
import { ref } from "vue";

import { fetchTodayLearningTime } from "~/api/user-learning-activity";
import { useLearningDailyTime } from "~/composables/learningDailyTime";
import { type CalendarDataItem } from "~/composables/user/calendarGraph";
import { useUserStore } from "~/store/user";
import { useLearningTimeTracker } from "../../composables/main/learningTimeTracker";

const userStore = useUserStore();
const { learningDailyTimeList, learningDailyTotalTime, setupLearningDailyTime } =
  useLearningDailyTime();
const { toggleYear } = useCalendarGraph();

useAsyncData(async () => {
  // Sync today's total learning time
  const { setupLearningTime } = useLearningTimeTracker();
  setupLearningTime(await fetchTodayLearningTime());
});

function useCalendarGraph() {
  const data = ref<CalendarDataItem[]>([]);
  const totalLearningTime = ref<number>(0);

  async function toggleYear(year?: number) {
    // TODO: support switching between multiple years
    setupLearningDailyTime();
  }

  return {
    data,
    totalLearningTime,
    toggleYear,
  };
}
</script>

<style scoped></style>
