<template>
  <div class="tracker-page">
    <div class="head">
      <div class="top-nav">
        <div class="title-section">
          <span class="app-title">LeetCode Problem Rating Tracker</span>
        </div>
        <div class="header-actions">
          <el-button type="success" size="small" plain @click="exportProgress">
            <el-icon><download /></el-icon>&nbsp;{{ $t("export") }}
          </el-button>
          <el-button type="primary" size="small" plain @click="triggerImport">
            <el-icon><upload /></el-icon>&nbsp;{{ $t("import") }}
          </el-button>
          <input
            type="file"
            ref="fileInputRef"
            accept=".json"
            @change="onFileImported"
            style="display: none"
          />
          <el-dropdown style="margin-left: 10px" @command="switchLocale">
            <span class="el-dropdown-link">
              {{ $t("lang") }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'en'">English</el-dropdown-item>
                <el-dropdown-item :command="'zh'">简体中文</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Compact Progress Dashboard -->
      <div class="dashboard-container">
        <el-card shadow="never" class="dashboard-card">
          <div class="dashboard-metrics">
            <div class="metric-card">
              <span class="metric-label">{{ $t("totalProblems") }}</span>
              <span class="metric-number metric-total">{{
                totalProblemsCount
              }}</span>
            </div>
            <div class="metric-sep"></div>
            <div class="metric-card">
              <span class="metric-label">{{ $t("solvedCount") }}</span>
              <span class="metric-number metric-solved">{{
                totalSolvedCount
              }}</span>
            </div>
            <div class="metric-sep"></div>
            <div class="metric-card">
              <span class="metric-label">{{ $t("unsolvedCount") }}</span>
              <span class="metric-number metric-unsolved">{{
                totalUnsolvedCount
              }}</span>
            </div>
            <div class="metric-sep"></div>
            <div class="metric-card progress-metric">
              <span class="metric-label">{{ $t("completionRate") }}</span>
              <div class="completion-box">
                <span class="metric-number metric-rate"
                  >{{ completionPercentage }}%</span
                >
                <el-progress
                  :percentage="completionPercentage"
                  :stroke-width="8"
                  :show-text="false"
                  color="#67c23a"
                  style="width: 110px"
                />
              </div>
            </div>
            <div class="metric-sep"></div>
            <div class="metric-card range-metric">
              <span class="metric-label">
                {{ $t("ratingRangeProgress") }}
                <span v-if="ratingRangeStats.hasRange" class="range-hint">
                  ({{ left ?? 0 }} - {{ right ?? "∞" }})
                </span>
              </span>
              <div class="range-box">
                <span class="metric-number range-values">
                  {{ ratingRangeStats.rangeSolved }} /
                  {{ ratingRangeStats.rangeTotal }}
                </span>
                <span class="range-rate"
                  >({{ ratingRangeStats.percentage }}%)</span
                >
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Filter Controls -->
      <div class="filter">
        <el-form :inline="true" class="filter-form">
          <el-form-item :label="$t('keyword')">
            <el-input
              :placeholder="$t('placeholder')"
              v-model="keyword"
              clearable
              @keyup.enter="query"
              @clear="query"
              style="width: 170px"
            />
          </el-form-item>

          <el-form-item :label="$t('status')">
            <el-radio-group v-model="statusFilter" @change="query">
              <el-radio-button label="all">{{ $t("all") }}</el-radio-button>
              <el-radio-button label="solved">{{
                $t("solved")
              }}</el-radio-button>
              <el-radio-button label="unsolved">{{
                $t("unsolved")
              }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('contestNumber')">
            <el-input-number
              v-model="contestIndex"
              :min="0"
              :max="9999"
              :controls="false"
              style="width: 80px"
              @keyup.enter="query"
            />
          </el-form-item>
          <el-form-item :label="$t('ratingInterval')">
            <el-input-number
              v-model="left"
              :min="0"
              :max="9999"
              :controls="false"
              style="width: 80px"
              @keyup.enter="query"
            />
          </el-form-item>
          <el-form-item> - </el-form-item>
          <el-form-item>
            <el-input-number
              v-model="right"
              :min="0"
              :max="9999"
              :controls="false"
              style="width: 80px"
              @keyup.enter="query"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query">{{
              $t("query")
            }}</el-button>
            <el-button type="danger" @click="reset">{{
              $t("reset")
            }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- Problems Table -->
    <div class="content">
      <el-table
        :data="problemSetShow"
        border
        stripe
        style="width: 90%"
        :table-layout="'auto'"
        :row-class-name="tableRowClassName"
        @sort-change="sortChange"
        :default-sort="{ prop: 'ID', order: 'descending' }"
      >
        <el-table-column :label="$t('status')" width="80" align="center">
          <template #default="scope">
            <el-checkbox
              :model-value="isSolved(scope.row.ID)"
              @change="toggleSolved(scope.row.ID)"
              size="large"
            />
          </template>
        </el-table-column>
        <el-table-column prop="ID" label="ID" width="130" sortable="custom" />
        <el-table-column :label="$t('problemName')">
          <template #default="scope">
            <div class="problem-title-cell">
              <el-icon
                v-if="isSolved(scope.row.ID)"
                class="solved-icon"
                color="#67c23a"
              >
                <circle-check-filled />
              </el-icon>
              <el-link
                :href="scope.row.ProblemHrefZH"
                target="_blank"
                v-if="locale === 'zh'"
                :class="{ 'solved-title': isSolved(scope.row.ID) }"
                >{{ scope.row.TitleZH }}
              </el-link>
              <el-link
                :href="scope.row.ProblemHrefEN"
                target="_blank"
                v-else
                :class="{ 'solved-title': isSolved(scope.row.ID) }"
                >{{ scope.row.Title }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('contestName')">
          <template #default="scope">
            <el-link
              :href="scope.row.ContestHrefZH"
              target="_blank"
              v-if="locale === 'zh'"
              >{{ scope.row.ContestID_zh }}
            </el-link>
            <el-link :href="scope.row.ContestHrefEN" target="_blank" v-else
              >{{ scope.row.ContestID_en }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="ProblemIndex"
          label="#"
          width="80"
          align="center"
        />
        <el-table-column
          :label="$t('rating')"
          prop="Rating"
          sortable="custom"
          width="120"
          align="right"
        >
          <template #default="scope">
            {{ formatNumber(scope.row.Rating) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div class="footer">
      <el-pagination
        :page-sizes="[10, 15, 20, 30, 40, 50, 100]"
        v-model:page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filterProblemSet.length"
        v-model:current-page="currentPage"
        @current-change="currentChange"
        @size-change="sizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from "vue";
import axios, { AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const url = "./data.json";
const STORAGE_KEY = "leetcode_solved_problem_ids";

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

const i18n = useI18n();
const locale = i18n.locale;
const left = ref<number | null>(null);
const right = ref<number | null>(null);
const sortInfo = reactive<SortInfo>({
  prop: "ID",
  order: "descending",
});
const pageSizeCache = localStorage.getItem("pageSize");
const pageSize = ref(pageSizeCache ? parseInt(pageSizeCache) : 15);
const contestIndex = ref<number | null>(null);
const problemSetAll: Array<Problem> = reactive([]);
const problemSetShow: Array<Problem> = reactive([]);
const filterProblemSet: Array<Problem> = reactive([]);
const keyword = ref("");
const currentPage = ref(1);
const statusFilter = ref<"all" | "solved" | "unsolved">("all");
const solvedIds = ref<Set<number>>(new Set());
const fileInputRef = ref<HTMLInputElement | null>(null);

function loadSolvedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const validIds = parsed
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0);
        solvedIds.value = new Set(validIds);
        return;
      }
    }
  } catch (e) {
    console.error("Failed to load solved problems from localStorage", e);
  }
  solvedIds.value = new Set();
}

function saveSolvedIds() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(solvedIds.value))
    );
  } catch (e) {
    console.error("Failed to save solved problems to localStorage", e);
  }
}

function isSolved(id: number): boolean {
  return solvedIds.value.has(id);
}

function toggleSolved(id: number) {
  const next = new Set(solvedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  solvedIds.value = next;
  saveSolvedIds();
  query();
}

function tableRowClassName({ row }: { row: Problem }): string {
  return isSolved(row.ID) ? "solved-row" : "";
}

// Dashboard statistics
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

const ratingRangeStats = computed(() => {
  const hasRange = left.value != null || right.value != null;
  let rangeTotal = 0;
  let rangeSolved = 0;
  for (const p of problemSetAll) {
    const rounded = Math.round(p.Rating);
    if (left.value != null && rounded < left.value) continue;
    if (right.value != null && rounded > right.value) continue;
    rangeTotal++;
    if (solvedIds.value.has(p.ID)) {
      rangeSolved++;
    }
  }
  const percentage =
    rangeTotal > 0 ? Number(((rangeSolved / rangeTotal) * 100).toFixed(1)) : 0;
  return {
    hasRange,
    rangeTotal,
    rangeSolved,
    percentage,
  };
});

// Import and Export
function exportProgress() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    totalSolved: solvedIds.value.size,
    solvedProblemIds: Array.from(solvedIds.value).sort((a, b) => a - b),
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `leetcode_solved_progress_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
  ElMessage.success(i18n.t("exportSuccess"));
}

function triggerImport() {
  fileInputRef.value?.click();
}

function onFileImported(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const parsed = JSON.parse(text);
      let incomingIds: number[] = [];

      if (Array.isArray(parsed)) {
        incomingIds = parsed;
      } else if (parsed && Array.isArray(parsed.solvedProblemIds)) {
        incomingIds = parsed.solvedProblemIds;
      } else {
        throw new Error("Invalid structure");
      }

      const validIds = incomingIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);

      const next = new Set(solvedIds.value);
      let added = 0;
      for (const id of validIds) {
        if (!next.has(id)) {
          next.add(id);
          added++;
        }
      }

      solvedIds.value = next;
      saveSolvedIds();
      query();

      ElMessage.success(
        i18n.t("importSuccess", { count: validIds.length, added })
      );
    } catch (err) {
      console.error("Import error", err);
      ElMessage.error(i18n.t("importError"));
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

onMounted(() => {
  loadSolvedIds();
  axios.get(url).then((res: AxiosResponse<Array<Problem>>) => {
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
  i18n.locale.value = newLocale;
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
      message: "left must less than right",
      duration: 1000,
    });
    return;
  }
  filterProblemSet.length = 0;
  problemSetAll.forEach((item) => {
    // Status filter
    if (statusFilter.value === "solved" && !solvedIds.value.has(item.ID)) {
      return;
    }
    if (statusFilter.value === "unsolved" && solvedIds.value.has(item.ID)) {
      return;
    }
    // Keyword search
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
    // Contest index search
    if (contestIndex.value != null) {
      const index = parseInt(item.ContestSlug.replace(/\D/gi, ""));
      if (index != contestIndex.value) {
        return;
      }
    }
    // Rating interval
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
.tracker-page {
  padding-bottom: 30px;
}

.head {
  display: flex;
  flex-direction: column;
}

.top-nav {
  width: 90%;
  margin: 15px auto 5px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section .app-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.dashboard-container {
  width: 90%;
  margin: 10px auto 5px auto;
}

.dashboard-card {
  border-radius: 8px;
  background-color: #fafafa;
  border: 1px solid #ebeef5;
}

.dashboard-metrics {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
}

.metric-sep {
  width: 1px;
  height: 38px;
  background-color: #e4e7ed;
}

.metric-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 3px;
}

.metric-number {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.metric-total {
  color: #409eff;
}

.metric-solved {
  color: #67c23a;
}

.metric-unsolved {
  color: #e6a23c;
}

.metric-rate {
  color: #67c23a;
  font-size: 18px;
}

.completion-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-box {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.range-values {
  font-size: 19px;
  color: #303133;
}

.range-rate {
  font-size: 13px;
  color: #67c23a;
  font-weight: 600;
}

.range-hint {
  font-size: 11px;
  color: #909399;
}

.filter {
  margin: 10px auto 0 auto;
  width: 90%;
  display: flex;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.content {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.problem-title-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.solved-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.solved-title {
  color: #529b2e !important;
  font-weight: 500;
}

:deep(.el-table .solved-row) {
  background-color: #f0f9eb !important;
}

:deep(.el-table .solved-row:hover > td.el-table__cell) {
  background-color: #e1f3d8 !important;
}

.footer {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
