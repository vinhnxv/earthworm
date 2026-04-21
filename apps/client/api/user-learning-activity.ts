import type { UserLearningDailyTime } from "~/types/models/user-learning-activity";
import { getHttp } from "./http";

export interface LearningTimeApiResponse {
  date: string;
  duration: number;
}

interface UpdateLearningTimeParams {
  date: string;
  duration: number;
}

export interface LearningTimeQueryParams {
  startDate?: string;
  endDate?: string;
}

function createLearningTimeQueryParams(params: LearningTimeQueryParams = {}) {
  return {
    activityType: "daily_total",
    ...params,
  };
}

export async function updateDailyLearningDailyTotalTime(params: UpdateLearningTimeParams) {
  const http = getHttp();
  return await http<boolean>("/user-learning-activities", {
    method: "post",
    body: {
      ...params,
      activityType: "daily_total",
    },
  });
}

export async function fetchTodayLearningTime() {
  const http = getHttp();
  const learningTimeList = await http<LearningTimeApiResponse[]>("/user-learning-activities", {
    method: "get",
    params: createLearningTimeQueryParams({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    }),
  });

  if (learningTimeList.length === 0) {
    return 0;
  }

  return learningTimeList[0].duration;
}

export async function fetchAllLearningTime(params: LearningTimeQueryParams = {}) {
  const http = getHttp();
  return (await http<LearningTimeApiResponse[]>("/user-learning-activities", {
    method: "get",
    params: createLearningTimeQueryParams(params),
  })) as UserLearningDailyTime[];
}

/**获取总的学习时长 */
export async function fetchTotalLearningTime(params: LearningTimeQueryParams = {}) {
  const http = getHttp();
  const result = await http<number>("/user-learning-activities/total", {
    method: "get",
    params: createLearningTimeQueryParams(params),
  });

  return Number(result);
}
