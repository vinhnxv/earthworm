<template>
  <div
    class="mt-16 flex flex-col items-center justify-center"
    id="pricing"
  >
    <div class="bg-opacity-75 py-16 text-center text-white">
      <div class="mb-6">
        <p
          class="relative pb-4 text-sm font-bold tracking-wider text-gray-500 before:absolute before:inset-x-0 before:bottom-0 before:mb-0 before:h-0.5 before:bg-gradient-to-r before:from-purple-500"
        >
          Pricing
        </p>
      </div>
      <h2
        class="bg-gradient-to-r from-purple-400 to-gray-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-purple-600 dark:to-gray-500 md:text-5xl"
      >
        Simple, transparent pricing <br />
        for everyone
      </h2>
      <p class="mt-6 text-sm leading-relaxed text-gray-500 dark:text-gray-300">
        <span>One payment, unlimited spaces, and free lifetime updates.</span><br />
        <span>Choose the plan that fits you</span>
      </p>
    </div>

    <div class="flex items-center justify-around space-x-20">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="card relative w-96 max-w-sm border-transparent p-8 shadow-xl"
        :class="{ 'lifetime-animation': feature.type === 'Lifetime' }"
      >
        <button
          class="button-unlock"
          v-if="feature.type === 'Lifetime'"
        >
          <UIcon
            name="i-ph-crown-simple-fill"
            class="crown h-6 w-6 text-[#f09f33]"
          ></UIcon>
          Unlock Pro
        </button>

        <div class="mb-6 text-left">
          <h2 class="text-gradient text-3xl font-bold">{{ feature.type }}</h2>
          <p class="program-description">
            {{
              feature.type === "Free"
                ? "Our basic plan already covers a lot, and it is a great way to begin your Earthworm journey."
                : "Get lifetime access to premium services and enjoy every feature Earthworm offers for your English learning journey."
            }}
          </p>
        </div>
        <div class="mb-8 text-left">
          <span class="mr-2 text-5xl font-extrabold text-black dark:text-white">
            {{ feature.type === "Free" ? "$0" : "$19" }}
          </span>
          <span class="gradient-text">{{
            feature.type === "Free" ? "Start now" : "Get access"
          }}</span>
        </div>
        <div class="text-left">
          <button
            @click="handleUpgrade(feature.type)"
            :class="
              feature.type === 'Free'
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-purple-600 hover:bg-purple-700'
            "
            class="w-full transform rounded-lg px-8 py-3 font-bold text-white transition duration-300 ease-in-out hover:scale-105"
          >
            {{ feature.type === "Free" ? "Get Started" : "Upgrade now" }}
          </button>
          <ul class="mt-4">
            <li
              v-for="(item, itemIndex) in feature.list"
              :key="`feature-${index}-item-${itemIndex}`"
              class="mb-6 mt-6 flex items-center"
            >
              <UIcon
                name="i-ph-check-bold"
                class="mr-2 h-5 w-5"
                :class="item.unique ? 'text-green-500' : 'text-gray-500'"
              ></UIcon>
              {{ item.text }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-6 bg-opacity-75 py-10 text-center text-white">
    <p class="text-xs text-gray-800 dark:text-gray-400 md:text-sm">
      If a new purchase needs a refund, <br class="md:hidden" />
      <span
        class="bg-gradient-to-r from-purple-400 via-purple-400 to-gray-400 bg-clip-text text-transparent dark:from-purple-600 dark:via-purple-600 dark:to-gray-500"
        >get a 100% refund within 7 days</span
      >
      from the purchase date.<br />
      After buying an Earthworm license,
      <span
        class="bg-gradient-to-r from-purple-400 via-purple-400 to-gray-400 bg-clip-text text-transparent dark:from-purple-600 dark:via-purple-600 dark:to-gray-500"
        >sign in</span
      >
      and
      <span
        class="bg-gradient-to-r from-purple-400 via-purple-400 to-gray-400 bg-clip-text text-transparent dark:from-purple-600 dark:via-purple-600 dark:to-gray-500"
        >register your license</span
      >
      to unlock all features.
    </p>
  </div>
  <CommonDivider />
</template>

<script setup>
const features = [
  {
    type: "Free",
    list: [
      { text: "Up to 5 spaces with cloud sync", unique: false },
      { text: "Up to 1,000 URLs with AI grouping", unique: false },
      { text: "Automatic AI grouping (coming soon)", unique: true },
      { text: "Basic support", unique: true },
      { text: "Free lifetime updates!", unique: true },
    ],
  },
  {
    type: "Lifetime",
    list: [
      { text: "Unlimited spaces with cloud sync", unique: true },
      { text: "Unlimited URLs with AI grouping", unique: true },
      { text: "Automatic AI grouping (coming soon)", unique: true },
      { text: "Premium lifetime support", unique: true },
      { text: "Free lifetime updates!", unique: true },
    ],
  },
];

async function handleUpgrade(type) {
  if (type === "Free") {
  } else {
  }
}
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(138, 100, 226, 0.25);
  transition:
    box-shadow 0.3s ease-in-out,
    transform 0.3s ease-in-out,
    background-color 0.3s ease-in-out; /* Add a background-color transition */
  will-change: transform;
}

.card:hover {
  transform: translateY(-5px);
  animation:
    dynamic-shadow 2s infinite alternate,
    pulse 2s infinite alternate;
}
button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

button::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: all 0.3s ease-in-out;
}

button:hover::after {
  left: 100%;
}
@keyframes dynamic-shadow {
  0% {
    box-shadow:
      0 0 10px rgba(139, 92, 246, 0.5),
      0 0 20px rgba(139, 92, 246, 0.4),
      0 0 40px rgba(139, 92, 246, 0.3);
  }
  100% {
    box-shadow:
      0 0 10px rgba(139, 92, 246, 0.7),
      0 0 25px rgba(139, 92, 246, 0.6),
      0 0 55px rgba(139, 92, 246, 0.5);
  }
}

@keyframes pulse {
  0% {
    background-color: rgba(10, 3, 3, 0.05);
  }
  100% {
    background-color: rgba(154, 101, 240, 0.1);
  }
}
.lifetime-animation {
  animation:
    dynamic-shadow 2s infinite alternate,
    pulse 2s infinite alternate;
}
.text-smaller,
.program-description {
  font-size: 0.875rem;
}

.program-description {
  color: #7087aa;
}

.dark .program-description {
  color: #9ca3af;
}

.gradient-text {
  background: linear-gradient(to right, #7e22ce, #adafb3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text-gradient {
  background: linear-gradient(to right, #7e22ce, #adafb3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.button-unlock {
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 0.4rem;
  border: none;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  text-shadow: 2px 2px 3px rgb(136 0 136 / 50%);
  background: linear-gradient(
      15deg,
      #880088,
      #aa2068,
      #cc3f47,
      #de6f3d,
      #f09f33,
      #de6f3d,
      #cc3f47,
      #aa2068,
      #880088
    )
    no-repeat;
  background-size: 300%;
  background-position: left center;
  transition: background 0.3s ease;
  color: #fff;
  position: absolute;
  right: 8px;
  top: 8px;
}

.button-unlock:hover {
  background-size: 320%;
  background-position: right center;
}

.button-unlock:hover .crown {
  color: #fff;
}

.button-unlock .crown {
  transition: 0.3s ease;
}
</style>
