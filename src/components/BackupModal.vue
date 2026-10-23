<template>
  <el-dialog
    v-model="visible"
    :title="$t('backupAndRestore')"
    width="540px"
    class="backup-dialog"
    :append-to-body="true"
    :destroy-on-close="false"
  >
    <div class="backup-container">
      <!-- Storage Status Card -->
      <div class="storage-info-card">
        <div class="info-row">
          <div class="info-stat">
            <span class="stat-label">{{ $t("storedSolvedCount") }}</span>
            <span class="stat-value text-success">{{ solvedCount }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="info-stat">
            <span class="stat-label">{{ $t("lastSaved") }}</span>
            <span class="stat-value date-text">{{ formattedLastUpdated }}</span>
          </div>
        </div>

        <div class="storage-notice-box">
          <el-icon class="notice-icon"><InfoFilled /></el-icon>
          <span class="notice-text">{{ $t("localStorageNotice") }}</span>
        </div>
      </div>

      <!-- Action List -->
      <div class="action-card-list">
        <!-- Action: Export -->
        <div class="action-card">
          <div class="section-text">
            <h4 class="section-title">{{ $t("exportBackup") }}</h4>
            <p class="section-desc">{{ $t("exportBackupDesc") }}</p>
          </div>
          <el-button type="primary" :icon="Download" @click="handleExport">
            {{ $t("exportBackup") }}
          </el-button>
        </div>

        <!-- Action: Import -->
        <div class="action-card">
          <div class="section-text">
            <h4 class="section-title">{{ $t("importBackup") }}</h4>
            <p class="section-desc">{{ $t("importBackupDesc") }}</p>
          </div>
          <el-button :icon="Upload" @click="triggerFileInput">
            {{ $t("selectBackupFile") }}
          </el-button>
        </div>

        <!-- Hidden file input for import -->
        <input
          type="file"
          ref="fileInputRef"
          accept=".json"
          @change="handleFileSelected"
          style="display: none"
        />

        <!-- Action: Clear / Reset -->
        <div class="action-card danger-card">
          <div class="section-text">
            <h4 class="section-title danger-text">{{ $t("clearAllData") }}</h4>
            <p class="section-desc">{{ $t("clearAllDataDesc") }}</p>
          </div>
          <el-button
            type="danger"
            plain
            :icon="Delete"
            @click="handleClearData"
          >
            {{ $t("clearAllData") }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- Import Confirmation Dialog -->
    <el-dialog
      v-model="importConfirmVisible"
      :title="$t('importBackup')"
      width="440px"
      append-to-body
    >
      <div class="import-confirm-body">
        <p class="confirm-message">
          {{
            $t("importFoundCount", {
              count: pendingImportData?.incomingSolvedCount || 0,
            })
          }}
        </p>
        <p class="confirm-prompt">{{ $t("importModePrompt") }}</p>

        <div class="import-mode-options">
          <el-radio-group v-model="importMode">
            <el-radio label="merge">
              <span class="mode-title">{{ $t("mergeData") }}</span>
            </el-radio>
            <el-radio label="replace">
              <span class="mode-title danger-text">{{
                $t("replaceData")
              }}</span>
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importConfirmVisible = false">{{
            $t("cancel")
          }}</el-button>
          <el-button type="primary" @click="executeImport">{{
            $t("confirm")
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download, Upload, Delete, InfoFilled } from "@element-plus/icons-vue";
import {
  storageService,
  ImportValidationResult,
} from "@/services/storageService";

const props = defineProps<{
  modelValue: boolean;
  solvedCount: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "data-changed"): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const importConfirmVisible = ref(false);
const importMode = ref<"merge" | "replace">("merge");
const pendingImportData = ref<ImportValidationResult | null>(null);

const formattedLastUpdated = computed(() => {
  const data = storageService.loadData();
  if (!data.updatedAt) return "-";
  try {
    const d = new Date(data.updatedAt);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return data.updatedAt;
  }
});

function handleExport() {
  try {
    const { filename, blob } = storageService.generateBackup();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    ElMessage.success(t("exportSuccess"));
  } catch (err) {
    console.error("Export error:", err);
    ElMessage.error("Failed to export backup.");
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const validation = storageService.validateBackup(text);

      if (!validation.valid || !validation.data) {
        ElMessage.error(t("importError"));
        return;
      }

      pendingImportData.value = validation;
      importConfirmVisible.value = true;
    } catch (err) {
      console.error("File parse error:", err);
      ElMessage.error(t("importError"));
    } finally {
      input.value = "";
    }
  };

  reader.readAsText(file);
}

function executeImport() {
  if (!pendingImportData.value || !pendingImportData.value.data) {
    importConfirmVisible.value = false;
    return;
  }

  const result = storageService.applyImport(
    pendingImportData.value.data,
    importMode.value
  );

  if (result.success) {
    ElMessage.success(
      t("importSuccess", {
        count: pendingImportData.value.incomingSolvedCount,
        added: result.added,
      })
    );
    importConfirmVisible.value = false;
    pendingImportData.value = null;
    emit("data-changed");
  } else {
    ElMessage.error(t("importError"));
  }
}

async function handleClearData() {
  try {
    await ElMessageBox.confirm(
      t("clearDataConfirmMsg"),
      t("clearDataConfirmTitle"),
      {
        confirmButtonText: t("clearDataConfirmBtn"),
        cancelButtonText: t("cancel"),
        type: "warning",
        confirmButtonClass: "el-button--danger",
      }
    );

    storageService.clearAllData();
    ElMessage.success(t("clearSuccess"));
    emit("data-changed");
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.backup-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.storage-info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.info-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.stat-value.text-success {
  color: #16a34a;
}

.date-text {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-top: 3px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background-color: #cbd5e1;
}

.storage-notice-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.notice-icon {
  font-size: 14px;
  color: #2563eb;
  margin-top: 2px;
  flex-shrink: 0;
}

.notice-text {
  font-size: 11.5px;
  line-height: 1.45;
  color: #1e40af;
}

.action-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #ffffff;
  gap: 16px;
  transition: all 0.15s ease;
}

.action-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.section-text {
  flex: 1;
}

.section-title {
  margin: 0 0 2px 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
}

.section-desc {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.danger-card {
  border-color: #fee2e2;
  background-color: #fffafa;
}

.danger-card:hover {
  border-color: #fca5a5;
}

.danger-text {
  color: #dc2626 !important;
}

.import-confirm-body {
  padding: 4px 0;
}

.confirm-message {
  margin: 0 0 8px 0;
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
}

.confirm-prompt {
  margin: 0 0 12px 0;
  font-size: 12.5px;
  color: #64748b;
}

.import-mode-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.mode-title {
  font-size: 12.5px;
  font-weight: 500;
  color: #1e293b;
}
</style>
