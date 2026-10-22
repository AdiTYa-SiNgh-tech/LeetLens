<template>
  <el-dialog
    v-model="visible"
    :title="$t('migrationTitle')"
    width="440px"
    class="migration-dialog-clean"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="migration-content">
      <p class="migration-description">
        {{
          $t("migrationDesc", {
            local: localCount,
            cloud: cloudCount,
          })
        }}
      </p>

      <div class="migration-stat-cards">
        <div class="stat-box">
          <span class="box-label">Local Browser</span>
          <span class="box-number">{{ localCount }}</span>
          <span class="box-sub">problems</span>
        </div>
        <div class="arrow-sep">→</div>
        <div class="stat-box">
          <span class="box-label">Cloud Account</span>
          <span class="box-number highlight">{{ cloudCount }}</span>
          <span class="box-sub">problems</span>
        </div>
      </div>

      <p class="migration-note">
        Your unique solved problems will be merged into your cloud account. No
        problems will be overwritten or lost.
      </p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleSkip" :disabled="loading" size="default">
          {{ $t("skipMigration") }}
        </el-button>
        <el-button
          type="primary"
          @click="handleMerge"
          :loading="loading"
          size="default"
        >
          {{ $t("mergeAction") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
  localCount: number;
  cloudCount: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "merge"): void;
  (e: "skip"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

function handleMerge() {
  emit("merge");
}

function handleSkip() {
  emit("skip");
  visible.value = false;
}
</script>

<style scoped>
:deep(.el-dialog.migration-dialog-clean) {
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.migration-content {
  padding: 4px 0;
}

.migration-description {
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.migration-stat-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}

.stat-box {
  flex: 1;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.box-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
}

.box-number {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0;
}

.box-number.highlight {
  color: #2563eb;
}

.box-sub {
  font-size: 11px;
  color: #94a3b8;
}

.arrow-sep {
  font-size: 16px;
  color: #94a3b8;
}

.migration-note {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}
</style>
