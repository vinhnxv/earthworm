<template>
  <div
    class="mt-16 w-full flex-col"
    id="what"
  >
    <CommonTitle
      title="What is Earthworm?"
      :description="['An open-source, collaborative, user-friendly English learning tool.']"
    />
    <section class="flex w-full justify-around py-8">
      <div
        class="flex h-[360px] w-[45%] flex-shrink-0 items-center justify-center rounded-2xl border border-gray-700 bg-[#111128]"
      >
        <div
          class="hide-scrollbar h-[96%] w-[97%] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-700 bg-[#17172e] px-5 py-4"
        >
          <h2 class="mb-3 rounded-lg bg-[#232339] py-4 text-center text-xl font-bold">
            Quick Start
          </h2>
          <h3 class="pb-2 text-base font-semibold">Current Page</h3>
          <p class="py-1">
            Click the
            <span
              class="mx-1 inline-block rounded-lg border border-solid border-fuchsia-300 px-1 text-fuchsia-300"
              >Get Started</span
            >
            <span class="text-gray-500">(or press Enter ⏎)</span>
            button to start your first lesson!
          </p>
          <h3 class="py-2 text-base font-semibold">Question Page</h3>
          <p class="py-1 leading-7">
            When the
            <span class="text-fuchsia-500">purple underline</span>
            lights up, type the word and press Space
            <span class="text-gray-500">(Space ␣)</span>
            to move to the next word. When you finish typing, press Enter
            <span class="text-gray-500">(Enter ⏎)</span>
            to submit your answer.
          </p>
          <p class="py-1 leading-7">
            If you see
            <span class="text-red-500">red</span>
            words and underlines after submitting, that means there are mistakes to fix. Press Space
            <span class="text-gray-500">(Space ␣)</span>
            to jump to the first incorrect word and clear it. After fixing it, press Space again to
            move to the next incorrect word.
          </p>
          <p class="py-1 leading-7">
            If you notice the previous incorrect word was not fixed correctly, press Backspace
            <span class="text-gray-500">(Backspace ⌫)</span>
            to go back to the previous incorrect word. Once all mistakes are corrected, press Enter
            to submit.
          </p>
          <p class="py-1 leading-7">
            After validation succeeds, the answer page will appear and the related audio will play
            to help reinforce memory.
          </p>
          <h3 class="py-2 text-base font-semibold">Quick Tips</h3>
          <p class="py-1 leading-7">
            Buttons in the bottom tips panel
            <a
              class="ml-1 text-[#3498db] hover:text-theme-dark"
              href="https://www.bilibili.com/video/BV1py421q7Mp/"
            >
              👉 One-minute quick intro</a
            >
          </p>
          <p class="p-1">
            <button class="instruction-btn">⌃ Ctrl+'</button>
            <span class="text-gray-500">(or press Ctrl+')</span>
            Play question audio
          </p>
          <p class="p-1">
            <button class="instruction-btn">⌃ Ctrl+;</button>
            <span class="text-gray-500">(or press Ctrl+;)</span>
            Show the answer
          </p>
          <h3 class="py-2 text-base font-semibold">Answer Page</h3>
          <p class="py-1 leading-7">Buttons under the answer</p>
          <p class="py-1">
            <button class="instruction-btn">again</button>
            <span class="text-gray-500">(or press Ctrl+;)</span>
            Try again as many times as you need!
          </p>
          <p class="py-1">
            <button class="instruction-btn">next</button>
            <span class="text-gray-500">(or press Enter)</span>
            Move to the next question and keep climbing the leaderboard! 🏄‍♂️
          </p>

          <h2 class="py-4 text-xl font-bold">Help</h2>
          <h3 class="pb-2 text-base font-semibold">Lesson Page</h3>
          <p class="py-1 leading-7">
            If all input underlines are gray and the
            <span class="text-fuchsia-500">purple highlight</span>
            is not active, you cannot type yet. Move the mouse and click the input field to focus it
            first.
          </p>
          <h3 class="py-2 text-base font-semibold">User Settings Page</h3>
          <p class="py-1 leading-7">
            Open User Info from the icon in the top-right corner. Switch to the settings page to
            customize your shortcuts. You can also control auto-play audio, fixed underline widths,
            submitting with Space, and more. Additional personal settings will keep coming. 😊
            <i
              class="mx-2 inline h-8 w-1 animate-wink bg-slate-900 p-[2px] text-sm dark:bg-white"
            ></i>
          </p>
        </div>
      </div>
      <div
        class="flex h-[360px] w-[45%] flex-shrink-0 items-center justify-center rounded-2xl border border-gray-700 bg-[#111128]"
      >
        <div
          class="hide-scrollbar h-[96%] w-[97%] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-700 bg-[#17172e] px-5 py-4"
        >
          <h2 class="mb-3 rounded-lg bg-[#232339] py-4 text-center text-xl font-bold">
            How it works: practice English by building sentences 😄
          </h2>
          <h3 class="pb-2 text-base font-semibold">Sentence-first Learning</h3>
          <p class="py-1">
            Each sentence contains words, phrases, and grammar. Once you learn a sentence, you can
            express it clearly.
          </p>
          <h3 class="py-2 text-base font-semibold">Break It Down</h3>
          <p class="py-1 leading-7">
            Break long, difficult sentences into small units such as words and phrases.
          </p>
          <h3 class="py-2 text-base font-semibold">Repetition</h3>
          <p class="py-1 leading-7">Build muscle memory through repeated practice.</p>
          <h3 class="py-2 text-base font-semibold">i+1</h3>
          <p class="py-1 leading-7">
            Increase difficulty step by step, starting with the simplest sentence patterns before
            moving to richer ideas.
          </p>
          <h3 class="pb-2 text-base font-semibold">Fast Positive Feedback</h3>
          <p class="py-1 leading-7">
            When you can write long, difficult sentences on your own, it feels rewarding and makes
            you want to keep learning. It breaks away from the traditional and often painful
            approach to learning English of memorizing word lists one by one. (Remember abandon? Oh
            no, now it is aback.)
          </p>
        </div>
      </div>
    </section>
  </div>
  <CommonDivider />
</template>

<script setup lang="ts"></script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

.hide-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
}
</style>
