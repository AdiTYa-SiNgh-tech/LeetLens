<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="400px"
    class="auth-dialog-clean"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
  >
    <!-- Notifications -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="true"
      @close="errorMessage = ''"
      class="auth-alert"
    />
    <el-alert
      v-if="infoMessage"
      :title="infoMessage"
      type="success"
      show-icon
      :closable="true"
      @close="infoMessage = ''"
      class="auth-alert"
    />

    <!-- SIGN IN FORM -->
    <el-form
      v-if="mode === 'signin'"
      @submit.prevent="handleSignIn"
      label-position="top"
    >
      <el-form-item :label="$t('email')">
        <el-input
          v-model="email"
          type="email"
          :placeholder="'name@example.com'"
          clearable
          autocomplete="username"
        />
      </el-form-item>

      <el-form-item :label="$t('password')">
        <el-input
          v-model="password"
          type="password"
          show-password
          :placeholder="'••••••••'"
          autocomplete="current-password"
        />
      </el-form-item>

      <div class="auth-aux-row">
        <el-link
          type="primary"
          :underline="false"
          @click="switchMode('forgot')"
          class="subtle-link"
        >
          {{ $t("forgotPassword") }}
        </el-link>
      </div>

      <el-button
        type="primary"
        class="auth-submit-btn"
        :loading="loading"
        :disabled="!isSignInValid"
        @click="handleSignIn"
      >
        {{ $t("signIn") }}
      </el-button>

      <div class="auth-switch-text">
        <span>{{ $t("noAccount") }}</span>
        <el-link
          type="primary"
          :underline="false"
          @click="switchMode('signup')"
        >
          &nbsp;{{ $t("signUp") }}
        </el-link>
      </div>
    </el-form>

    <!-- SIGN UP FORM -->
    <el-form
      v-else-if="mode === 'signup'"
      @submit.prevent="handleSignUp"
      label-position="top"
    >
      <el-form-item :label="$t('email')">
        <el-input
          v-model="email"
          type="email"
          :placeholder="'name@example.com'"
          clearable
          autocomplete="username"
        />
      </el-form-item>

      <el-form-item :label="$t('password')">
        <el-input
          v-model="password"
          type="password"
          show-password
          :placeholder="'At least 6 characters'"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-form-item :label="$t('confirmPassword')">
        <el-input
          v-model="confirmPassword"
          type="password"
          show-password
          :placeholder="'Re-enter password'"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-button
        type="primary"
        class="auth-submit-btn"
        :loading="loading"
        :disabled="!isSignUpValid"
        @click="handleSignUp"
      >
        {{ $t("signUp") }}
      </el-button>

      <div class="auth-switch-text">
        <span>{{ $t("haveAccount") }}</span>
        <el-link
          type="primary"
          :underline="false"
          @click="switchMode('signin')"
        >
          &nbsp;{{ $t("signIn") }}
        </el-link>
      </div>
    </el-form>

    <!-- FORGOT PASSWORD FORM -->
    <el-form
      v-else-if="mode === 'forgot'"
      @submit.prevent="handleForgotPassword"
      label-position="top"
    >
      <p class="auth-desc-text">
        Enter your account email to receive a password recovery link.
      </p>
      <el-form-item :label="$t('email')">
        <el-input
          v-model="email"
          type="email"
          :placeholder="'name@example.com'"
          clearable
          autocomplete="username"
        />
      </el-form-item>

      <el-button
        type="primary"
        class="auth-submit-btn"
        :loading="loading"
        :disabled="!isValidEmail"
        @click="handleForgotPassword"
      >
        {{ $t("sendResetLink") }}
      </el-button>

      <div class="auth-switch-text">
        <el-link :underline="false" @click="switchMode('signin')">
          ← {{ $t("backToSignIn") }}
        </el-link>
      </div>
    </el-form>

    <!-- RESET PASSWORD FORM -->
    <el-form
      v-else-if="mode === 'reset'"
      @submit.prevent="handleUpdatePassword"
      label-position="top"
    >
      <p class="auth-desc-text">Choose a new password for your account.</p>
      <el-form-item :label="$t('newPassword')">
        <el-input
          v-model="password"
          type="password"
          show-password
          :placeholder="'At least 6 characters'"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-form-item :label="$t('confirmPassword')">
        <el-input
          v-model="confirmPassword"
          type="password"
          show-password
          :placeholder="'Re-enter password'"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-button
        type="primary"
        class="auth-submit-btn"
        :loading="loading"
        :disabled="!isResetValid"
        @click="handleUpdatePassword"
      >
        {{ $t("resetPassword") }}
      </el-button>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useAuth } from "@/services/authService";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";

const props = defineProps<{
  modelValue: boolean;
  initialMode?: "signin" | "signup" | "forgot" | "reset";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "auth-success"): void;
}>();

const { t } = useI18n();
const { signIn, signUp, resetPasswordForEmail, updatePassword } = useAuth();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const mode = ref<"signin" | "signup" | "forgot" | "reset">(
  props.initialMode || "signin"
);

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMessage = ref("");
const infoMessage = ref("");

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
});

const isSignInValid = computed(() => {
  return isValidEmail.value && password.value.length >= 6;
});

const isSignUpValid = computed(() => {
  return (
    isValidEmail.value &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
  );
});

const isResetValid = computed(() => {
  return password.value.length >= 6 && password.value === confirmPassword.value;
});

const dialogTitle = computed(() => {
  switch (mode.value) {
    case "signin":
      return t("signIn");
    case "signup":
      return t("signUp");
    case "forgot":
      return t("forgotPassword");
    case "reset":
      return t("resetPassword");
    default:
      return t("signIn");
  }
});

function switchMode(newMode: "signin" | "signup" | "forgot" | "reset") {
  mode.value = newMode;
  errorMessage.value = "";
  infoMessage.value = "";
}

async function handleSignIn() {
  if (!isSignInValid.value) return;
  loading.value = true;
  errorMessage.value = "";

  const { error } = await signIn(email.value, password.value);
  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
  } else {
    ElMessage.success(t("authSuccessSignIn"));
    visible.value = false;
    emit("auth-success");
  }
}

async function handleSignUp() {
  if (!isSignUpValid.value) {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = t("passwordsDoNotMatch");
    }
    return;
  }
  loading.value = true;
  errorMessage.value = "";

  const { error, user } = await signUp(email.value, password.value);
  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
  } else {
    if (user && user.identities && user.identities.length === 0) {
      errorMessage.value = "An account with this email already exists.";
    } else {
      infoMessage.value = t("authSuccessSignUp");
      ElMessage.success(t("authSuccessSignUp"));
      visible.value = false;
      emit("auth-success");
    }
  }
}

async function handleForgotPassword() {
  if (!isValidEmail.value) {
    errorMessage.value = t("validEmailRequired");
    return;
  }
  loading.value = true;
  errorMessage.value = "";

  const { error } = await resetPasswordForEmail(email.value);
  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
  } else {
    infoMessage.value = t("authSuccessReset");
    ElMessage.success(t("authSuccessReset"));
  }
}

async function handleUpdatePassword() {
  if (!isResetValid.value) {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = t("passwordsDoNotMatch");
    } else if (password.value.length < 6) {
      errorMessage.value = t("passwordTooShort");
    }
    return;
  }
  loading.value = true;
  errorMessage.value = "";

  const { error } = await updatePassword(password.value);
  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
  } else {
    ElMessage.success(t("authSuccessPassUpdated"));
    visible.value = false;
    emit("auth-success");
  }
}

defineExpose({
  open(targetMode: "signin" | "signup" | "forgot" | "reset" = "signin") {
    mode.value = targetMode;
    errorMessage.value = "";
    infoMessage.value = "";
    password.value = "";
    confirmPassword.value = "";
    visible.value = true;
  },
});
</script>

<style scoped>
:deep(.el-dialog.auth-dialog-clean) {
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -4px rgba(0, 0, 0, 0.03);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 20px;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

:deep(.el-dialog__body) {
  padding: 18px 20px 20px 20px;
}

.auth-alert {
  margin-bottom: 14px;
}

.auth-desc-text {
  font-size: 13px;
  color: #64748b;
  margin-top: -4px;
  margin-bottom: 14px;
  line-height: 1.4;
}

.auth-aux-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -6px;
  margin-bottom: 16px;
}

.subtle-link {
  font-size: 12px;
}

.auth-submit-btn {
  width: 100%;
  height: 38px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  background-color: #2563eb;
  border-color: #2563eb;
}

.auth-submit-btn:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.auth-switch-text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 14px;
  font-size: 13px;
  color: #64748b;
}
</style>
