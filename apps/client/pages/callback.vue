<!-- Login callback for Logto -->
<script setup lang="ts">
import { useHandleSignInCallback } from "@logto/vue";
import { navigateTo, useI18n } from "#imports";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { fetchCurrentUser } from "~/api/user";
import { getSignInCallback } from "~/services/auth";
import { useUserStore } from "~/store/user";

const { t } = useI18n();
const userStore = useUserStore();
const { username, isLoadingFetchUserSetup, isShowSettingUsernameModal, handleChangeUsername } =
  useUsername();

const useAutoRedirect = (delay: number) => {
  const redirectTimer = ref<NodeJS.Timeout | null>(null);
  const startAutoRedirect = () => {
    redirectTimer.value = setTimeout(() => {
      navigateTo("/");
    }, delay);
  };

  const stopAutoRedirect = () => {
    if (redirectTimer.value) {
      clearTimeout(redirectTimer.value);
      redirectTimer.value = null;
    }
  };

  return { startAutoRedirect, stopAutoRedirect };
};

const { startAutoRedirect, stopAutoRedirect } = useAutoRedirect(3000);

const { isLoading, error } = useHandleSignInCallback(async () => {
  stopAutoRedirect();
  const res = await fetchCurrentUser();
  userStore.initUser(res);

  // New users without a username need to set one
  if (userStore.isNewUser()) {
    isShowSettingUsernameModal.value = true;
  } else {
    await navigateTo(getSignInCallback());
  }
});

onMounted(() => {
  startAutoRedirect();
});

onUnmounted(() => {
  stopAutoRedirect();
});

// If sign-in fails, redirect to the home page
watch(error, (newError) => {
  if (newError) {
    toast.error(t("errors.loginFailed"), {
      description: t("errors.loginFailedDesc", { error: newError }),
      duration: 4000,
      onAutoClose: () => {
        navigateTo("/");
      },
    });
  }
});

function useUsername() {
  const username = ref("");
  const isShowSettingUsernameModal = ref(false);
  const isLoadingFetchUserSetup = ref(false);

  async function handleChangeUsername() {
    if (!checkUsername()) return;

    isLoadingFetchUserSetup.value = true;
    await userStore.setupNewUser({
      username: username.value,
      avatar: userStore.user?.avatar!,
    });
    isLoadingFetchUserSetup.value = false;

    navigateTo(getSignInCallback());
    isShowSettingUsernameModal.value = false;
  }

  function checkUsername() {
    const minLength = 2;

    if (!username.value) {
      toast.error(t("user.usernameSetup.errors.empty"));
      return false;
    }

    if (username.value.length < minLength) {
      toast.error(t("user.usernameSetup.errors.minLength", { min: minLength }));
      return false;
    }

    const regex = /^[A-Za-z_]\w*$/;
    if (!regex.test(username.value)) {
      toast.error(t("user.usernameSetup.errors.invalid"));
      return false;
    }

    return true;
  }

  return {
    checkUsername,
    username,
    isShowSettingUsernameModal,
    isLoadingFetchUserSetup,
    handleChangeUsername,
  };
}
</script>

<template>
  <div class="flex w-full flex-col pt-2">
    <template v-if="isLoading && !isShowSettingUsernameModal">
      <Loading></Loading>
    </template>
    <UModal
      v-model="isShowSettingUsernameModal"
      :ui="{ width: 'w-full sm:max-w-lg' }"
      prevent-close
    >
      <UCard>
        <h3 class="mb-4 text-lg font-bold">{{ $t("user.usernameSetup.title") }}</h3>
        <input
          v-model="username"
          type="text"
          :placeholder="$t('user.usernameSetup.placeholder')"
          class="input input-sm input-bordered w-full"
          maxlength="20"
          @keydown.enter="handleChangeUsername"
        />
        <div class="modal-action">
          <UButton
            type="submit"
            @click="handleChangeUsername"
          >
            {{ $t("common.determine") }}
            <span
              v-if="isLoadingFetchUserSetup"
              class="loading loading-spinner loading-lg"
            ></span>
          </UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
