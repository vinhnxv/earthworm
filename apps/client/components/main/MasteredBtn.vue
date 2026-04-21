<template>
  <button
    class="btn btn-outline btn-sm"
    @click="markStatementAsMastered"
  >
    {{ $t("game.mastered.button") }}
  </button>
</template>

<script setup lang="ts">
import { useMastered } from "~/composables/main/useMastered";

const { markStatementAsMastered } = useMastered();
</script>

<style scoped></style>
