import { ref } from "vue";

import type { LearningTimeQueryParams } from "~/api/user-learning-activity";
import { fetchAllLearningTime, fetchTotalLearningTime } from "~/api/user-learning-activity";
import { type UserLearningDailyTime } from "~/types/models/user-learning-activity";

const learningDailyTimeList = ref<UserLearningDailyTime[]>([]);
const learningDailyTotalTime = ref(0);

export function useLearningDailyTime() {
  async function setupLearningDailyTime(params: LearningTimeQueryParams = {}) {
    learningDailyTimeList.value = await fetchAllLearningTime(params);
    learningDailyTotalTime.value = await fetchTotalLearningTime(params);
  }

  return {
    learningDailyTimeList,
    learningDailyTotalTime,
    setupLearningDailyTime,
  };
}
