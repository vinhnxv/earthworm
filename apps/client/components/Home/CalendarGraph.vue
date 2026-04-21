<template>
  <section class="study-graph">
    <div class="graph-heading">
      <div>
        <p class="graph-eyebrow">Study Activity</p>
        <h3 class="graph-title">{{ headline }}</h3>
      </div>
      <p class="graph-total">{{ totalLabel }}</p>
    </div>

    <div class="graph-layout">
      <div class="graph-card">
        <div
          class="graph-scroll"
          ref="tableContainer"
        >
          <table class="graph-table">
            <thead>
              <tr>
                <th class="week-label-cell"></th>
                <th
                  v-for="{ colSpan, month } in thead"
                  :key="month"
                  :colspan="colSpan"
                  class="month-label"
                >
                  {{ month }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in tbody"
                :key="weekLabels[i]"
              >
                <td class="week-label-cell">
                  <span class="week-label">{{ i % 2 !== 0 ? weekLabels[i] : "" }}</span>
                </td>
                <td
                  v-for="(cell, j) in row"
                  :key="j"
                >
                  <UTooltip :text="cell?.tips">
                    <div
                      class="cell"
                      :class="[cell?.bg]"
                    ></div>
                  </UTooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="graph-footer">
          <p class="graph-note">Each square represents one day of study.</p>
          <div class="graph-legend">
            <span>Less</span>
            <div class="cell"></div>
            <div class="cell low"></div>
            <div class="cell moderate"></div>
            <div class="cell high"></div>
            <div class="cell higher"></div>
            <span>More</span>
          </div>
        </div>
      </div>

      <aside class="year-rail">
        <button
          v-for="yearOption in yearOptions"
          :key="yearOption.value"
          class="year-pill"
          :class="{ active: selectedYear === yearOption.value }"
          @click="selectYear(yearOption.value)"
        >
          {{ yearOption.label }}
        </button>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "#imports";
import { computed, nextTick, onMounted, ref, watchEffect } from "vue";

import type { CalendarDataItem, EmitsType } from "~/composables/user/calendarGraph";
import { useCalendarGraph } from "~/composables/user/calendarGraph";

enum ActivityLevel {
  Low = "low",
  Moderate = "moderate",
  High = "high",
  Higher = "higher",
}

const props = defineProps<{
  data: CalendarDataItem[];
  totalLearningTime: number;
}>();

const emits = defineEmits<EmitsType>();
const tableContainer = ref<HTMLDivElement | null>(null);
const { locale } = useI18n();
const currentYear = new Date().getFullYear();

const {
  initTable,
  renderBody,
  thead,
  tbody,
  weekLabels,
  yearOptions,
  year: selectedYear,
} = useCalendarGraph(
  emits,
  {
    getActivityLevel(item) {
      if (!item) return "";

      const duration = secondToMinutes(item.duration);
      if (duration < 10) return ActivityLevel.Low;
      if (duration < 30) return ActivityLevel.Moderate;
      if (duration < 60) return ActivityLevel.High;
      return ActivityLevel.Higher;
    },
    tipFormatter(current) {
      if (current.duration === 0) return `${current?.date} had no study activity`;

      let tip = "";
      const minutes = secondToMinutes(current.duration);
      if (minutes < 1) {
        tip = "less than 1 minute";
      } else {
        tip = ` ${secondToMinutes(current.duration)} minutes`;
      }
      return `${current.date} studied${tip}`;
    },
  },
  locale.value,
);

const selectedDisplayYear = computed(() => selectedYear.value ?? currentYear);
const activeDayCount = computed(() => props.data.filter((item) => item.duration > 0).length);
const headline = computed(() => {
  if (activeDayCount.value === 0) {
    return `No study activity in ${selectedDisplayYear.value}`;
  }

  const label = activeDayCount.value === 1 ? "study day" : "study days";
  return `${activeDayCount.value} ${label} in ${selectedDisplayYear.value}`;
});
const totalLabel = computed(() => {
  return props.totalLearningTime > 0
    ? `${formatLearningTime(props.totalLearningTime)} total`
    : "No study time logged yet";
});

function secondToMinutes(second: number) {
  return Math.floor(second / 60);
}

function formatLearningTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    if (minutes === 0) {
      return `less than 1 minute`;
    } else {
      return `${minutes}min`;
    }
  }
}

onMounted(() => {
  selectYear(currentYear);
});

function syncScrollPosition() {
  nextTick(() => {
    if (tableContainer.value) {
      tableContainer.value.scrollLeft = 0;
    }
  });
}

function selectYear(year: number) {
  initTable(year);
  syncScrollPosition();
}

watchEffect(() => {
  tbody.value = renderBody(props.data);
});
</script>

<style scoped>
.study-graph {
  --graph-bg: #0d1117;
  --graph-panel: #0f1724;
  --graph-border: #30363d;
  --graph-text: #c9d1d9;
  --graph-text-strong: #f0f6fc;
  --graph-muted: #8b949e;
  --graph-accent: #1f6feb;
  --graph-empty: #161b22;
}

.graph-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.7rem;
}

.graph-eyebrow {
  margin: 0 0 0.2rem;
  color: var(--graph-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.graph-title {
  margin: 0;
  color: var(--graph-text-strong);
  font-size: clamp(1.05rem, 1.8vw, 1.45rem);
  font-weight: 700;
  line-height: 1.1;
}

.graph-total {
  margin: 0;
  color: #7ee787;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
}

.graph-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
}

.graph-card {
  border: 1px solid var(--graph-border);
  border-radius: 16px;
  background: radial-gradient(circle at top left, rgba(31, 111, 235, 0.12), transparent 26%),
    linear-gradient(180deg, var(--graph-bg) 0%, var(--graph-panel) 100%);
  box-shadow:
    inset 0 1px 0 rgba(240, 246, 252, 0.03),
    0 18px 48px rgba(2, 6, 23, 0.24);
  padding: 0.75rem 0.8rem 0.7rem;
}

.graph-scroll {
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 148, 158, 0.45) transparent;
}

.graph-scroll::-webkit-scrollbar {
  height: 8px;
}

.graph-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 148, 158, 0.4);
  border-radius: 999px;
}

.graph-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.graph-table {
  width: max-content;
  border-collapse: separate;
  border-spacing: 4px 4px;
}

.graph-table td,
.graph-table th {
  padding: 0;
}

.week-label-cell {
  width: 34px;
  padding-right: 0.25rem;
  text-align: left;
  position: relative;
}

.week-label {
  display: inline-block;
  color: var(--graph-text);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  white-space: nowrap;
}

.month-label {
  padding: 0 0 0.28rem 0.05rem;
  color: var(--graph-text);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.graph-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.7rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(48, 54, 61, 0.72);
}

.graph-note {
  margin: 0;
  color: var(--graph-muted);
  font-size: 0.88rem;
}

.graph-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  color: var(--graph-muted);
  font-size: 0.95rem;
  white-space: nowrap;
}

.cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--graph-empty);
  box-shadow: inset 0 0 0 1px rgba(240, 246, 252, 0.03);
  transition:
    transform 160ms ease,
    filter 160ms ease,
    box-shadow 160ms ease;
}

.cell:hover {
  transform: scale(1.12);
  filter: brightness(1.08);
  box-shadow: inset 0 0 0 1px rgba(240, 246, 252, 0.14);
}

.low {
  background: #0e4429;
}

.moderate {
  background: #006d32;
}

.high {
  background: #26a641;
}

.higher {
  background: #39d353;
}

.year-rail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 84px;
}

.year-pill {
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--graph-muted);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.72rem 0.9rem;
  text-align: center;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.year-pill:hover {
  background: rgba(22, 27, 34, 0.96);
  border-color: rgba(48, 54, 61, 0.92);
  color: var(--graph-text-strong);
  transform: translateY(-1px);
}

.year-pill.active {
  background: var(--graph-accent);
  border-color: rgba(240, 246, 252, 0.14);
  box-shadow: 0 10px 24px rgba(31, 111, 235, 0.32);
  color: white;
}

@media (max-width: 1280px) {
  .graph-layout {
    grid-template-columns: 1fr;
  }

  .year-rail {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: 0;
  }

  .year-pill {
    min-width: 92px;
  }
}

@media (max-width: 768px) {
  .graph-heading,
  .graph-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .week-label-cell {
    width: 30px;
  }

  .week-label,
  .month-label,
  .graph-legend {
    font-size: 0.85rem;
  }
}
</style>
