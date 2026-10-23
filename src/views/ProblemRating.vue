<template>
  <div class="leetlens-app">
    <!-- NAVIGATION BAR -->
    <header class="app-nav">
      <div class="nav-container">
        <!-- Logo & Brand -->
        <div class="brand" @click="currentTab = 'dashboard'">
          <div class="brand-icon-wrap">
            <svg
              class="brand-logo"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="7.5" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
              <path d="M11 7.5v7M7.5 11h7" />
            </svg>
          </div>
          <span class="brand-title">LeetLens</span>
        </div>

        <!-- Section Navigation -->
        <nav class="nav-tabs">
          <button
            class="nav-tab"
            :class="{ active: currentTab === 'dashboard' }"
            @click="currentTab = 'dashboard'"
          >
            <el-icon class="tab-icon"><Odometer /></el-icon>
            <span>{{ $t("navDashboard") }}</span>
          </button>
          <button
            class="nav-tab"
            :class="{ active: currentTab === 'problems' }"
            @click="currentTab = 'problems'"
          >
            <el-icon class="tab-icon"><Document /></el-icon>
            <span>{{ $t("navProblems") }}</span>
          </button>
        </nav>

        <!-- Right: Local Storage indicator, Backup & Restore, Language -->
        <div class="nav-actions">
          <!-- Local Storage Indicator Pill -->
          <button
            class="storage-indicator"
            @click="backupModalVisible = true"
            :title="$t('backupAndRestore')"
          >
            <span class="dot"></span>
            <span class="storage-text">{{ $t("localStorageBadge") }}</span>
          </button>

          <!-- Backup & Restore Action Button -->
          <button
            class="nav-btn-action"
            @click="backupModalVisible = true"
            :title="$t('backupAndRestore')"
          >
            <el-icon><FolderChecked /></el-icon>
            <span>{{ $t("backupAndRestore") }}</span>
          </button>

          <!-- Language Selector -->
          <el-dropdown @command="switchLocale">
            <button class="nav-btn-lang">
              <span class="lang-text">{{ locale.toUpperCase() }}</span>
              <el-icon class="icon-right"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'en'">English</el-dropdown-item>
                <el-dropdown-item :command="'zh'">简体中文</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- HIDDEN FILE INPUT FOR TOOLBAR IMPORT -->
    <input
      type="file"
      ref="fileInputRef"
      accept=".json"
      @change="onFileImported"
      style="display: none"
    />

    <!-- MAIN CONTAINER -->
    <main class="main-container">
      <!-- COMPACT DASHBOARD SECTION -->
      <section v-show="currentTab === 'dashboard'" class="dashboard-block">
        <!-- 4 Summary Metrics in One Row -->
        <div class="summary-metrics-row">
          <div class="metric-item">
            <span class="metric-label">{{ $t("totalProblems") }}</span>
            <span class="metric-number">{{
              totalProblemsCount.toLocaleString()
            }}</span>
          </div>

          <div class="metric-divider"></div>

          <div class="metric-item">
            <span class="metric-label">{{ $t("solvedCount") }}</span>
            <span class="metric-number text-success">{{
              totalSolvedCount.toLocaleString()
            }}</span>
          </div>

          <div class="metric-divider"></div>

          <div class="metric-item">
            <span class="metric-label">{{ $t("unsolvedCount") }}</span>
            <span class="metric-number text-muted">{{
              totalUnsolvedCount.toLocaleString()
            }}</span>
          </div>

          <div class="metric-divider"></div>

          <div class="metric-item rate-metric-item">
            <span class="metric-label">{{ $t("completionRate") }}</span>
            <div class="rate-group">
              <span class="metric-number text-primary"
                >{{ completionPercentage }}%</span
              >
              <div class="mini-progress-track">
                <div
                  class="mini-progress-fill"
                  :style="{ width: `${completionPercentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compact Rating Tier Distribution -->
        <rating-distribution
          :problems="problemSetAll"
          :solved-set="solvedIds"
        />
      </section>

      <!-- PROBLEMS EXPLORER (Priority 1 View) -->
      <section class="explorer-block">
        <!-- Compact Filter & Action Toolbar -->
        <div class="toolbar">
          <div class="toolbar-filters">
            <!-- Keyword Search -->
            <el-input
              v-model="keyword"
              :placeholder="$t('placeholder')"
              prefix-icon="Search"
              clearable
              size="default"
              class="filter-search"
              @keyup.enter="query"
              @clear="query"
            />

            <!-- Status Radio Toggle -->
            <el-radio-group
              v-model="statusFilter"
              @change="query"
              size="default"
              class="status-radio-group"
            >
              <el-radio-button label="all">{{ $t("all") }}</el-radio-button>
              <el-radio-button label="solved">{{
                $t("solved")
              }}</el-radio-button>
              <el-radio-button label="unsolved">{{
                $t("unsolved")
              }}</el-radio-button>
            </el-radio-group>

            <!-- Contest Number -->
            <div class="inline-field">
              <span class="field-label">{{ $t("contestNumber") }}:</span>
              <el-input-number
                v-model="contestIndex"
                :min="0"
                :max="9999"
                :controls="false"
                size="default"
                style="width: 74px"
                @keyup.enter="query"
              />
            </div>

            <!-- Rating Range -->
            <div class="inline-field">
              <span class="field-label">{{ $t("ratingInterval") }}:</span>
              <el-input-number
                v-model="left"
                :min="0"
                :max="9999"
                :controls="false"
                placeholder="Min"
                size="default"
                style="width: 68px"
                @keyup.enter="query"
              />
              <span class="dash">—</span>
              <el-input-number
                v-model="right"
                :min="0"
                :max="9999"
                :controls="false"
                placeholder="Max"
                size="default"
                style="width: 68px"
                @keyup.enter="query"
              />
            </div>

            <!-- Query & Reset -->
            <div class="btn-group">
              <el-button
                type="primary"
                size="default"
                :icon="Search"
                @click="query"
              >
                {{ $t("query") }}
              </el-button>
              <el-button size="default" :icon="RefreshRight" @click="reset">
                {{ $t("reset") }}
              </el-button>
            </div>
          </div>

          <!-- Unobtrusive Export/Import Actions -->
          <div class="toolbar-tools">
            <span class="filter-count">
              {{ filterProblemSet.length.toLocaleString() }} /
              {{ problemSetAll.length.toLocaleString() }}
            </span>
            <button
              class="tool-btn"
              @click="exportProgress"
              :title="$t('export')"
            >
              <el-icon><Download /></el-icon>&nbsp;{{ $t("export") }}
            </button>
            <button
              class="tool-btn"
              @click="triggerImport"
              :title="$t('import')"
            >
              <el-icon><Upload /></el-icon>&nbsp;{{ $t("import") }}
            </button>
          </div>
        </div>

        <!-- Problems Table -->
        <div class="table-wrap">
          <el-table
            :data="problemSetShow"
            border
            style="width: 100%"
            :table-layout="'auto'"
            :row-class-name="tableRowClassName"
            @sort-change="sortChange"
            :default-sort="{ prop: 'ID', order: 'descending' }"
            v-loading="loadingData"
          >
            <!-- Checkbox -->
            <el-table-column width="48" align="center">
              <template #default="scope">
                <el-checkbox
                  :model-value="isSolved(scope.row.ID)"
                  @change="toggleSolved(scope.row.ID)"
                  size="default"
                />
              </template>
            </el-table-column>

            <!-- ID -->
            <el-table-column
              prop="ID"
              label="ID"
              width="88"
              sortable="custom"
              align="center"
            >
              <template #default="scope">
                <span class="col-id">#{{ scope.row.ID }}</span>
              </template>
            </el-table-column>

            <!-- Problem Title -->
            <el-table-column :label="$t('problemName')" min-width="260">
              <template #default="scope">
                <div class="title-cell">
                  <el-icon
                    v-if="isSolved(scope.row.ID)"
                    class="solved-icon"
                    color="#16a34a"
                  >
                    <CircleCheckFilled />
                  </el-icon>
                  <el-link
                    :href="scope.row.ProblemHrefZH"
                    target="_blank"
                    v-if="locale === 'zh'"
                    class="problem-link"
                    :class="{ solved: isSolved(scope.row.ID) }"
                  >
                    {{ scope.row.TitleZH }}
                  </el-link>
                  <el-link
                    :href="scope.row.ProblemHrefEN"
                    target="_blank"
                    v-else
                    class="problem-link"
                    :class="{ solved: isSolved(scope.row.ID) }"
                  >
                    {{ scope.row.Title }}
                  </el-link>
                </div>
              </template>
            </el-table-column>

            <!-- Contest Name -->
            <el-table-column :label="$t('contestName')" min-width="190">
              <template #default="scope">
                <el-link
                  :href="scope.row.ContestHrefZH"
                  target="_blank"
                  v-if="locale === 'zh'"
                  class="contest-link"
                >
                  {{ scope.row.ContestID_zh }}
                </el-link>
                <el-link
                  :href="scope.row.ContestHrefEN"
                  target="_blank"
                  v-else
                  class="contest-link"
                >
                  {{ scope.row.ContestID_en }}
                </el-link>
              </template>
            </el-table-column>

            <!-- Question Number (#) -->
            <el-table-column
              prop="ProblemIndex"
              label="#"
              width="70"
              align="center"
            >
              <template #default="scope">
                <span class="index-label">{{ scope.row.ProblemIndex }}</span>
              </template>
            </el-table-column>

            <!-- Elo Rating -->
            <el-table-column
              :label="$t('rating')"
              prop="Rating"
              sortable="custom"
              width="110"
              align="right"
            >
              <template #default="scope">
                <span
                  class="rating-value"
                  :style="getRatingTextStyle(scope.row.Rating)"
                >
                  {{ formatNumber(scope.row.Rating) }}
                </span>
              </template>
            </el-table-column>

            <!-- Empty State -->
            <template #empty>
              <div class="empty-box">
                <p>{{ $t("emptyState") }}</p>
                <el-button size="small" @click="reset">{{
                  $t("clearFilters")
                }}</el-button>
              </div>
            </template>
          </el-table>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar">
          <el-pagination
            :page-sizes="[15, 25, 50, 100]"
            v-model:page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filterProblemSet.length"
            v-model:current-page="currentPage"
            @current-change="currentChange"
            @size-change="sizeChange"
          />
        </div>
      </section>
    </main>

    <!-- BACKUP & RESTORE MODAL -->
    <backup-modal
      v-model="backupModalVisible"
      :solved-count="solvedIds.size"
      @data-changed="onStorageDataChanged"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from "vue";
import axios, { AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { Search, RefreshRight } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { storageService } from "@/services/storageService";
import RatingDistribution from "@/components/RatingDistribution.vue";
import BackupModal from "@/components/BackupModal.vue";

const url = "./data.json";

interface Problem {
  ContestID_en: string;
  ContestID_zh: string;
  ContestSlug: string;
  ID: number;
  ProblemIndex: string;
  Rating: number;
  Title: string;
  TitleSlug: string;
  TitleZH: string;
  ProblemHrefZH: string | null;
  ProblemHrefEN: string | null;
  ContestHrefEN: string | null;
  ContestHrefZH: string | null;
}

interface SortInfo {
  prop: "Rating" | "ID";
  order: string;
}

const { t, locale } = useI18n();

// Active tab
const currentTab = ref<"dashboard" | "problems">("dashboard");

// Table & filtering state
const left = ref<number | null>(null);
const right = ref<number | null>(null);
const sortInfo = reactive<SortInfo>({
  prop: "ID",
  order: "descending",
});
const pageSizeCache = localStorage.getItem("pageSize");
const pageSize = ref(pageSizeCache ? parseInt(pageSizeCache) : 25);
const contestIndex = ref<number | null>(null);
const problemSetAll: Array<Problem> = reactive([]);
const problemSetShow: Array<Problem> = reactive([]);
const filterProblemSet: Array<Problem> = reactive([]);
const keyword = ref("");
const currentPage = ref(1);
const statusFilter = ref<"all" | "solved" | "unsolved">("all");
const loadingData = ref(true);

// Solved progress state (managed via storageService)
const solvedIds = ref<Set<number>>(new Set());

// Modals
const backupModalVisible = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Dashboard metrics
const totalProblemsCount = computed(() => problemSetAll.length);

const totalSolvedCount = computed(() => {
  let count = 0;
  for (const p of problemSetAll) {
    if (solvedIds.value.has(p.ID)) {
      count++;
    }
  }
  return count;
});

const totalUnsolvedCount = computed(() => {
  return Math.max(0, totalProblemsCount.value - totalSolvedCount.value);
});

const completionPercentage = computed(() => {
  if (totalProblemsCount.value === 0) return 0;
  return Number(
    ((totalSolvedCount.value / totalProblemsCount.value) * 100).toFixed(1)
  );
});

// Meaningful, refined rating colors
function getRatingTextStyle(rating: number) {
  const r = Math.round(rating);
  if (r >= 2200) {
    return { color: "#dc2626", fontWeight: "600" };
  } else if (r >= 1800) {
    return { color: "#d97706", fontWeight: "600" };
  } else if (r >= 1400) {
    return { color: "#2563eb", fontWeight: "500" };
  } else {
    return { color: "#16a34a", fontWeight: "500" };
  }
}

function isSolved(id: number): boolean {
  return solvedIds.value.has(id);
}

// Toggle solved state with immediate local storage persistence
function toggleSolved(id: number) {
  const result = storageService.toggleSolved(id);
  solvedIds.value = new Set(result.allSolved);
  query();
}

function tableRowClassName({ row }: { row: Problem }): string {
  return isSolved(row.ID) ? "solved-row" : "";
}

// Export progress
function exportProgress() {
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

function triggerImport() {
  fileInputRef.value?.click();
}

// Toolbar JSON Import handler
function onFileImported(event: Event) {
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

      const result = storageService.applyImport(validation.data, "merge");
      if (result.success) {
        solvedIds.value = storageService.getSolvedIds();
        query();
        ElMessage.success(
          t("importSuccess", {
            count: validation.incomingSolvedCount,
            added: result.added,
          })
        );
      } else {
        ElMessage.error(t("importError"));
      }
    } catch (err) {
      console.error("Import error:", err);
      ElMessage.error(t("importError"));
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

function onStorageDataChanged() {
  solvedIds.value = storageService.getSolvedIds();
  query();
}

// Lifecycle
onMounted(async () => {
  solvedIds.value = storageService.getSolvedIds();

  axios
    .get(url)
    .then((res: AxiosResponse<Array<Problem>>) => {
      const problems = res.data;
      problems.forEach((item) => {
        item.ProblemHrefZH = "https://leetcode.cn/problems/" + item.TitleSlug;
        item.ProblemHrefEN = "https://leetcode.com/problems/" + item.TitleSlug;
        item.ContestHrefZH = "https://leetcode.cn/contest/" + item.ContestSlug;
        item.ContestHrefEN = "https://leetcode.com/contest/" + item.ContestSlug;
        problemSetAll.push(item);
        filterProblemSet.push(item);
      });
      query();
    })
    .finally(() => {
      loadingData.value = false;
    });
});

function sortChange(s: SortInfo) {
  if (s.prop == null) {
    sortInfo.order = "descending";
    sortInfo.prop = "ID";
  } else {
    sortInfo.order = s.order;
    sortInfo.prop = s.prop;
  }
  query();
}

function switchLocale(newLocale: string) {
  locale.value = newLocale;
  localStorage.setItem("locale", newLocale);
}

function formatNumber(rating: number) {
  return Math.round(rating);
}

function currentChange() {
  problemSetShow.length = 0;
  const no = currentPage.value;
  const size = pageSize.value;
  const total = filterProblemSet.length;
  for (let i = (no - 1) * size; i < Math.min(total, no * size); i++) {
    problemSetShow.push(filterProblemSet[i]);
  }
}

function sizeChange() {
  currentPage.value = 1;
  localStorage.setItem("pageSize", String(pageSize.value));
  currentChange();
}

function query() {
  if (left.value != null && right.value != null && right.value < left.value) {
    ElMessage.error({
      message: "Minimum rating must be less than maximum rating",
      duration: 1500,
    });
    return;
  }

  filterProblemSet.length = 0;
  problemSetAll.forEach((item) => {
    if (statusFilter.value === "solved" && !solvedIds.value.has(item.ID)) {
      return;
    }
    if (statusFilter.value === "unsolved" && solvedIds.value.has(item.ID)) {
      return;
    }
    if (keyword.value.trim().length > 0) {
      const k = keyword.value.trim().toLowerCase();
      if (
        !item.TitleZH.toLowerCase().includes(k) &&
        !item.Title.toLowerCase().includes(k) &&
        !item.TitleSlug.toLowerCase().includes(k) &&
        !String(item.ID).includes(k)
      ) {
        return;
      }
    }
    if (contestIndex.value != null) {
      const index = parseInt(item.ContestSlug.replace(/\D/gi, ""));
      if (index !== contestIndex.value) {
        return;
      }
    }
    if (left.value != null && Math.round(item.Rating) < left.value) {
      return;
    }
    if (right.value != null && Math.round(item.Rating) > right.value) {
      return;
    }
    filterProblemSet.push(item);
  });

  filterProblemSet.sort((a: Problem, b: Problem) => {
    if (sortInfo.order === "descending") {
      return b[sortInfo.prop] - a[sortInfo.prop];
    } else {
      return a[sortInfo.prop] - b[sortInfo.prop];
    }
  });

  sizeChange();
}

function reset() {
  keyword.value = "";
  contestIndex.value = null;
  left.value = null;
  right.value = null;
  statusFilter.value = "all";
  sortInfo.order = "descending";
  sortInfo.prop = "ID";
  query();
}
</script>

<style scoped>
.leetlens-app {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #0f172a;
  display: flex;
  flex-direction: column;
}

/* NAVBAR */
.app-nav {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.15s ease;
}

.nav-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.brand-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  transition: all 0.15s ease;
}

.brand:hover .brand-icon-wrap {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.brand-logo {
  width: 16px;
  height: 16px;
}

.brand-title {
  font-size: 15.5px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-tab {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding: 6px 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nav-tab .tab-icon {
  font-size: 14px;
}

.nav-tab:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

.nav-tab.active {
  color: #2563eb;
  background-color: #eff6ff;
  font-weight: 600;
}

/* Nav Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.storage-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.storage-indicator:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.storage-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
}

.storage-text {
  font-weight: 500;
  color: #334155;
}

.nav-btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.nav-btn-action:hover {
  color: #2563eb;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.nav-btn-lang {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  padding: 5px 9px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.nav-btn-lang:hover {
  color: #0f172a;
  background: #f8fafc;
  border-color: #cbd5e1;
}

.lang-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.icon-right {
  font-size: 10px;
}

/* MAIN BODY */
.main-container {
  max-width: 1320px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 20px 48px 20px;
  box-sizing: border-box;
}

/* SUMMARY METRICS ROW */
.summary-metrics-row {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 24px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.metric-label {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-number {
  font-size: 23px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.metric-number.text-success {
  color: #16a34a;
}

.metric-number.text-muted {
  color: #64748b;
}

.metric-number.text-primary {
  color: #2563eb;
}

.metric-divider {
  width: 1px;
  height: 32px;
  background-color: #f1f5f9;
  margin: 0 20px;
}

.rate-metric-item {
  flex: 1.2;
}

.rate-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-progress-track {
  flex: 1;
  max-width: 120px;
  height: 7px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background-color: #2563eb;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* EXPLORER & TOOLBAR */
.explorer-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 11px 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-search {
  width: 200px;
}

.inline-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.dash {
  color: #94a3b8;
  font-size: 12px;
}

.btn-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toolbar-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 8px;
  border-radius: 5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
}

.tool-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

/* TABLE STYLING */
.table-wrap {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  overflow: hidden;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #475569;
  --el-table-text-color: #1e293b;
  --el-table-border-color: #f1f5f9;
  font-size: 13px;
}

:deep(.el-table th.el-table__cell) {
  font-weight: 600;
  font-size: 11.5px;
  padding: 9px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.el-table td.el-table__cell) {
  padding: 7px 0;
}

:deep(.el-table--border .el-table__inner-wrapper::after),
:deep(.el-table--border::after),
:deep(.el-table--border::before) {
  display: none;
}

:deep(.solved-row) {
  background-color: #fcfffd !important;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}

.solved-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.col-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.problem-link {
  font-weight: 500;
  color: #0f172a !important;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.15s ease;
}

.problem-link:hover {
  color: #2563eb !important;
}

.problem-link.solved {
  color: #334155 !important;
}

.contest-link {
  font-size: 12px;
  color: #64748b !important;
  text-decoration: none;
}

.contest-link:hover {
  color: #2563eb !important;
}

.index-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.rating-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
}

.empty-box {
  padding: 36px 0;
  text-align: center;
  color: #64748b;
}

.empty-box p {
  margin-bottom: 14px;
  font-size: 13px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding: 14px 4px;
}

@media (max-width: 900px) {
  .summary-metrics-row {
    flex-wrap: wrap;
    gap: 14px;
    padding: 16px;
  }
  .metric-divider {
    display: none;
  }
  .metric-item {
    min-width: 45%;
  }
}

@media (max-width: 600px) {
  .nav-container {
    padding: 0 12px;
  }
  .brand-title {
    display: none;
  }
  .main-container {
    padding: 12px 12px 36px 12px;
  }
  .filter-search {
    width: 100%;
  }
}
</style>
