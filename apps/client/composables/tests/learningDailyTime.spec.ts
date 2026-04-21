import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchAllLearningTime, fetchTotalLearningTime } from "~/api/user-learning-activity";
import { useLearningDailyTime } from "../learningDailyTime";

vi.mock("~/api/user-learning-activity", () => ({
  fetchAllLearningTime: vi.fn(),
  fetchTotalLearningTime: vi.fn(),
}));

describe("useLearningDailyTime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchAllLearningTime).mockResolvedValue([]);
    vi.mocked(fetchTotalLearningTime).mockResolvedValue(0);
  });

  it("passes the selected year range to both learning-time endpoints", async () => {
    const { setupLearningDailyTime } = useLearningDailyTime();
    const params = { startDate: "2025-01-01", endDate: "2025-12-31" };

    await setupLearningDailyTime(params);

    expect(fetchAllLearningTime).toHaveBeenCalledWith(params);
    expect(fetchTotalLearningTime).toHaveBeenCalledWith(params);
  });
});
