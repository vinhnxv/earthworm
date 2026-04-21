<template>
  <section
    class="body-font overflow-hidden pt-24 text-gray-600"
    id="faq"
  >
    <CommonTitle
      title="Frequently Asked Questions"
      :description="[
        `If you cannot find what you need, join our Telegram group`,
        `We will get back to you as soon as possible!`,
      ]"
    />
    <div class="divide-y divide-gray-100 py-16 dark:divide-gray-800">
      <template
        v-for="(qsItem, qsIndex) in QUESTIONS"
        :key="qsIndex"
      >
        <details
          class="group"
          :open="qsIndex === 0"
        >
          <summary class="flex cursor-pointer items-center justify-between py-5">
            <h2 class="text-base font-medium text-black dark:text-gray-300 lg:text-lg">
              {{ qsItem.title }}
            </h2>
            <UIcon
              name="i-ph-caret-right-bold"
              class="icon h-6 w-6"
            ></UIcon>
          </summary>
          <div
            class="transition-max-height mb-4 overflow-hidden duration-500 ease-in-out dark:text-gray-500"
          >
            <template
              v-for="(asItem, asIndex) in qsItem.content"
              :key="`content-${asIndex}`"
            >
              <p class="py-2 text-sm lg:text-base">
                <span v-if="qsItem.content.length > 1">{{ asIndex + 1 }}. </span>
                {{ asItem }}
              </p>
            </template>
          </div>
        </details>
      </template>
    </div>
  </section>
  <CommonDivider />
</template>

<script setup lang="ts">
const QUESTIONS = [
  {
    title: "How can I request more features from the development team?",
    content: [
      "Join our official Telegram group and describe the feature you want in detail, including the problem it should solve.",
      "You can also submit your feature request on GitHub issues.",
    ],
  },
  {
    title: "How can I report an error or bug I found in the app?",
    content: [
      "If you find an error or bug in the app, join our official Telegram group and share a detailed description plus steps to reproduce it. A short video is even better 🤪",
    ],
  },
  {
    title: "How can I contribute code to Earthworm?",
    content: [
      "We provide a complete contribution guide. Start there first. You can find the link in the footer.",
      "Browse GitHub issues, or open a new issue based on a problem you found while using the app and try fixing it yourself.",
    ],
  },
  {
    title: "Is the Earthworm project completely free?",
    content: [
      "Not entirely. Long-term development requires paid plans. In the future, we plan to use a subscription model to provide members with more learning content and features.",
    ],
  },
];
</script>

<style scoped>
.icon {
  transition: transform 0.5s ease;
}

details[open] .icon {
  transform: rotate(90deg);
}

.transition-max-height {
  max-height: 0;
  transition: max-height 0.5s ease-in-out;
}

details[open] .transition-max-height {
  max-height: 500px;
}
</style>
