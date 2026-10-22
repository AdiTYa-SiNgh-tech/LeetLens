<template>
  <div class="leetlens-app">
    <!-- NAVIGATION BAR -->
    <header class="app-nav">
      <div class="nav-container">
        <!-- Logo & Brand -->
        <div class="brand" @click="currentTab = 'dashboard'">
          <svg
            class="brand-logo"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          <span class="brand-title">LeetLens</span>
        </div>

        <!-- Section Navigation -->
        <nav class="nav-tabs">
          <button
            class="nav-tab"
            :class="{ active: currentTab === 'dashboard' }"
            @click="currentTab = 'dashboard'"
          >
            {{ $t("navDashboard") }}
          </button>
          <button
            class="nav-tab"
            :class="{ active: currentTab === 'problems' }"
            @click="currentTab = 'problems'"
          >
            {{ $t("navProblems") }}
          </button>
        </nav>

        <!-- Right: Sync status, Language, Auth -->
        <div class="nav-actions">
          <!-- Sync Status Pill -->
          <button
            class="sync-indicator"
            :class="{
              'is-cloud': isAuthenticated,
              'is-guest': !isAuthenticated,
            }"
            @click="handleSyncClick"
            :title="isAuthenticated ? $t('refreshSync') : $t('signIn')"
          >
            <span class="dot"></span>
            <span class="sync-text">
              {{
                syncInProgress
                  ? $t("syncing")
                  : isAuthenticated
                  ? $t("cloudSynced")
                  : $t("guestMode")
              }}
            </span>
            <el-icon
              v-if="isAuthenticated"
              class="sync-icon"
              :class="{ spin: syncInProgress }"
            >
              <Refresh />
            </el-icon>
          </button>

          <!-- Language Selector -->
          <el-dropdown @command="switchLocale">
            <button class="nav-btn-text">
              {{ locale.toUpperCase() }}
              <el-icon class="icon-right"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'en'">English</el-dropdown-item>
                <el-dropdown-item :command="'zh'">简体中文</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- Guest: Sign in / Get Started -->
          <template v-if="!isAuthenticated">
            <button class="nav-btn-text" @click="openAuthModal('signin')">
              {{ $t("signIn") }}
            </button>
            <button class="btn-primary" @click="openAuthModal('signup')">
              {{ $t("getStarted") }}
            </button>
          </template>

          <!-- Authenticated: Profile Dropdown -->
          <template v-else>
            <el-dropdown trigger="click" @command="handleUserMenuCommand">
              <button class="user-btn">
                <span class="user-avatar">{{ userInitial }}</span>
                <span class="user-email">{{ truncatedEmail }}</span>
                <el-icon class="icon-right"><ArrowDown /></el-icon>
              </button>
              <template #dropdown>
                <el-dropdown-menu class="user-menu-dropdown">
                  <div class="menu-user-header">
                    <span class="menu-email">{{ userEmail }}</span>
                    <span class="menu-status">{{ $t("cloudSynced") }}</span>
                  </div>
                  <el-dropdown-item divided command="sync">
                    <el-icon><Refresh /></el-icon>{{ $t("refreshSync") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>{{ $t("export") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="import">
                    <el-icon><Upload /></el-icon>{{ $t("import") }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="signout">
                    <el-icon color="#dc2626"><SwitchButton /></el-icon>
                    <span class="danger-text">{{ $t("signOut") }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </header>

    <!-- HIDDEN FILE INPUT -->
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
            <span class="metric-number">{{ totalProblemsCount }}</span>
          </div>

          <div class="metric-divider"></div>

          <div class="metric-item">
            <span class="metric-label">{{ $t("solvedCount") }}</span>
            <span class="metric-number text-success">{{
              totalSolvedCount
            }}</span>
          </div>

          <div class="metric-divider"></div>

          <div class="metric-item">
            <span class="metric-label">{{ $t("unsolvedCount") }}</span>
            <span class="metric-number text-muted">{{
              totalUnsolvedCount
            }}</span>
          </div>

          <div class="metric-divider"></div>

          <div class="metric-item">
            <span class="metric-label">{{ $t("completionRate") }}</span>
            <div class="rate-group">
              <span class="metric-number">{{ completionPercentage }}%</span>
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
                style="width: 70px"
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
                style="width: 65px"
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
                style="width: 65px"
                @keyup.enter="query"
              />
            </div>

            <!-- Query & Reset -->
            <div class="btn-group">
              <el-button type="primary" size="default" @click="query">
                {{ $t("query") }}
              </el-button>
              <el-button size="default" @click="reset">
                {{ $t("reset") }}
              </el-button>
            </div>
          </div>

          <!-- Unobtrusive Export/Import Actions -->
          <div class="toolbar-tools">
            <span class="filter-count">
              {{ filterProblemSet.length }} / {{ problemSetAll.length }}
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
            <el-table-column width="50" align="center">
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
              width="90"
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
            <el-table-column :label="$t('contestName')" min-width="200">
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

    <!-- AUTH MODAL -->
    <auth-modal
      v-model="authModalVisible"
      :initial-mode="authModalMode"
      @auth-success="handleAuthSuccess"
      ref="authModalRef"
    />

    <!-- MIGRATION MODAL -->
    <migration-modal
      v-model="migrationModalVisible"
      :local-count="localSolvedCount"
      :cloud-count="cloudSolvedCount"
      :loading="migrationLoading"
      @merge="handleConfirmMigration"
      @skip="handleSkipMigration"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref, computed, watch } from "vue";
import axios, { AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/services/authService";
import { createCloudProgressService } from "@/services/progressService";
import AuthModal from "@/components/AuthModal.vue";
import MigrationModal from "@/components/MigrationModal.vue";
import RatingDistribution from "@/components/RatingDistribution.vue";

const url = "./data.json";

// Storage keys
const GUEST_STORAGE_KEY = "leetcode_guest_solved_ids";
const LEGACY_STORAGE_KEY = "leetcode_solved_problem_ids";

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
const {
  isAuthenticated,
  userEmail,
  initAuth,
  signOut: authSignOut,
  passwordRecoveryMode,
} = useAuth();

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

// Solved progress state
const solvedIds = ref<Set<number>>(new Set());
const syncInProgress = ref(false);

// Modals
const authModalVisible = ref(false);
const authModalMode = ref<"signin" | "signup" | "forgot" | "reset">("signin");
const authModalRef = ref<InstanceType<typeof AuthModal> | null>(null);

const migrationModalVisible = ref(false);
const localSolvedCount = ref(0);
const cloudSolvedCount = ref(0);
const migrationLoading = ref(false);

const fileInputRef = ref<HTMLInputElement | null>(null);

// User email display helpers
const userInitial = computed(() => {
  return (userEmail.value.charAt(0) || "U").toUpperCase();
});

const truncatedEmail = computed(() => {
  const email = userEmail.value;
  if (!email) return "";
  if (email.length <= 20) return email;
  return email.substring(0, 17) + "...";
});

// Watch password recovery trigger
watch(passwordRecoveryMode, (isRecovery) => {
  if (isRecovery) {
    authModalMode.value = "reset";
    authModalVisible.value = true;
  }
});

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

// Muted rating color: only where communicating meaningful information
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

// Local storage management
function getGuestSolvedIds(): Set<number> {
  try {
    const raw =
      localStorage.getItem(GUEST_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0);
        return new Set(valid);
      }
    }
  } catch (e) {
    console.error("Failed to read guest storage:", e);
  }
  return new Set();
}

function saveGuestSolvedIds(ids: Set<number>) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error("Failed to save guest storage:", e);
  }
}

// Progress loading
async function loadProgress() {
  if (isAuthenticated.value) {
    const cloudService = createCloudProgressService();
    if (cloudService) {
      try {
        syncInProgress.value = true;
        const cloudSet = await cloudService.fetchSolvedIds();
        solvedIds.value = cloudSet;
      } catch (err) {
        console.error("Error loading cloud progress:", err);
      } finally {
        syncInProgress.value = false;
      }
      return;
    }
  }
  solvedIds.value = getGuestSolvedIds();
}

function isSolved(id: number): boolean {
  return solvedIds.value.has(id);
}

// Toggle solved state
async function toggleSolved(id: number) {
  const isCurrentlySolved = solvedIds.value.has(id);
  const nextSet = new Set(solvedIds.value);

  if (isCurrentlySolved) {
    nextSet.delete(id);
  } else {
    nextSet.add(id);
  }

  solvedIds.value = nextSet;
  query();

  if (isAuthenticated.value) {
    const cloudService = createCloudProgressService();
    if (cloudService) {
      try {
        if (isCurrentlySolved) {
          await cloudService.markUnsolved(id);
        } else {
          await cloudService.markSolved(id);
        }
      } catch (err) {
        console.error("Failed to save status to cloud:", err);
        const revertSet = new Set(solvedIds.value);
        if (isCurrentlySolved) {
          revertSet.add(id);
        } else {
          revertSet.delete(id);
        }
        solvedIds.value = revertSet;
        query();
        ElMessage.error(t("syncError"));
      }
    }
  } else {
    saveGuestSolvedIds(nextSet);
  }
}

function tableRowClassName({ row }: { row: Problem }): string {
  return isSolved(row.ID) ? "solved-row" : "";
}

// Authentication handling
function openAuthModal(mode: "signin" | "signup" | "forgot" | "reset") {
  authModalMode.value = mode;
  authModalVisible.value = true;
}

async function handleAuthSuccess() {
  await handlePostLoginCheck();
}

async function handlePostLoginCheck() {
  const guestSet = getGuestSolvedIds();
  const cloudService = createCloudProgressService();

  if (!cloudService) {
    await loadProgress();
    query();
    return;
  }

  syncInProgress.value = true;
  try {
    const cloudSet = await cloudService.fetchSolvedIds();
    solvedIds.value = cloudSet;

    const unmergedLocalIds = Array.from(guestSet).filter(
      (id) => !cloudSet.has(id)
    );
    if (unmergedLocalIds.length > 0) {
      localSolvedCount.value = guestSet.size;
      cloudSolvedCount.value = cloudSet.size;
      migrationModalVisible.value = true;
    }
  } catch (err) {
    console.error("Post login sync error:", err);
  } finally {
    syncInProgress.value = false;
    query();
  }
}

async function handleConfirmMigration() {
  const guestSet = getGuestSolvedIds();
  const cloudService = createCloudProgressService();
  if (!cloudService) return;

  migrationLoading.value = true;
  try {
    const { added, error } = await cloudService.mergeSolvedIds(
      Array.from(guestSet)
    );
    if (error) {
      ElMessage.error(error);
    } else {
      ElMessage.success(t("migrationSuccess", { count: added }));
      const nextSet = await cloudService.fetchSolvedIds();
      solvedIds.value = nextSet;
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      migrationModalVisible.value = false;
      query();
    }
  } catch (e) {
    console.error("Migration error:", e);
    ElMessage.error(t("syncError"));
  } finally {
    migrationLoading.value = false;
  }
}

function handleSkipMigration() {
  migrationModalVisible.value = false;
  ElMessage.info("Using cloud progress.");
}

async function handleSignOut() {
  await authSignOut();
  solvedIds.value = new Set();
  await loadProgress();
  query();
  ElMessage.success(t("authSuccessSignOut"));
}

function handleUserMenuCommand(command: string) {
  if (command === "sync") {
    handleSyncClick();
  } else if (command === "export") {
    exportProgress();
  } else if (command === "import") {
    triggerImport();
  } else if (command === "signout") {
    handleSignOut();
  }
}

async function handleSyncClick() {
  if (!isAuthenticated.value) {
    openAuthModal("signin");
    return;
  }

  const cloudService = createCloudProgressService();
  if (!cloudService) return;

  syncInProgress.value = true;
  try {
    const set = await cloudService.fetchSolvedIds();
    solvedIds.value = set;
    query();
    ElMessage.success(t("syncSuccess"));
  } catch (err) {
    console.error("Sync error:", err);
    ElMessage.error(t("syncError"));
  } finally {
    syncInProgress.value = false;
  }
}

// Import & Export
async function exportProgress() {
  let idsToExport: number[] = [];

  if (isAuthenticated.value) {
    const cloudService = createCloudProgressService();
    if (cloudService) {
      try {
        idsToExport = await cloudService.exportProgress();
      } catch (e) {
        console.error("Failed to export from cloud:", e);
      }
    }
  }

  if (idsToExport.length === 0) {
    idsToExport = Array.from(solvedIds.value).sort((a, b) => a - b);
  }

  const payload = {
    version: 1,
    appName: "LeetLens",
    exportedAt: new Date().toISOString(),
    totalSolved: idsToExport.length,
    solvedProblemIds: idsToExport,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `leetlens_progress_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
  ElMessage.success(t("exportSuccess"));
}

function triggerImport() {
  fileInputRef.value?.click();
}

function onFileImported(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
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

      if (validIds.length === 0 && incomingIds.length > 0) {
        throw new Error("No valid problem IDs found in file");
      }

      if (isAuthenticated.value) {
        const cloudService = createCloudProgressService();
        if (cloudService) {
          const { added, error } = await cloudService.mergeSolvedIds(validIds);
          if (error) {
            ElMessage.error(error);
            return;
          }
          const updated = await cloudService.fetchSolvedIds();
          solvedIds.value = updated;
          query();
          ElMessage.success(
            t("importSuccess", { count: validIds.length, added })
          );
          return;
        }
      }

      const next = new Set(solvedIds.value);
      let added = 0;
      for (const id of validIds) {
        if (!next.has(id)) {
          next.add(id);
          added++;
        }
      }
      solvedIds.value = next;
      saveGuestSolvedIds(next);
      query();
      ElMessage.success(t("importSuccess", { count: validIds.length, added }));
    } catch (err) {
      console.error("Import error:", err);
      ElMessage.error(t("importError"));
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

// Lifecycle
onMounted(async () => {
  await initAuth();
  await loadProgress();

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
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.brand-logo {
  width: 20px;
  height: 20px;
  color: #2563eb;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #0f172a;
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-tab {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-tab:hover {
  color: #0f172a;
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

.sync-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: transparent;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.sync-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.sync-indicator.is-cloud {
  color: #16a34a;
}

.sync-indicator.is-cloud .dot {
  background-color: #16a34a;
}

.sync-indicator.is-guest {
  color: #d97706;
}

.sync-indicator.is-guest .dot {
  background-color: #d97706;
}

.sync-icon {
  font-size: 11px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.nav-btn-text {
  background: transparent;
  border: none;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn-text:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.icon-right {
  font-size: 10px;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 3px 8px 3px 4px;
  border-radius: 20px;
  cursor: pointer;
}

.user-btn:hover {
  border-color: #cbd5e1;
}

.user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-email {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
}

.user-menu-dropdown {
  min-width: 180px;
}

.menu-user-header {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
}

.menu-email {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

.menu-status {
  font-size: 11px;
  color: #16a34a;
}

.danger-text {
  color: #dc2626;
}

/* MAIN BODY */
.main-container {
  max-width: 1320px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 16px 40px 16px;
  box-sizing: border-box;
}

/* SUMMARY METRICS ROW */
.summary-metrics-row {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 14px 20px;
  margin-bottom: 12px;
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.metric-number {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.metric-number.text-success {
  color: #16a34a;
}

.metric-number.text-muted {
  color: #64748b;
}

.metric-divider {
  width: 1px;
  height: 28px;
  background-color: #f1f5f9;
  margin: 0 16px;
}

.rate-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress-track {
  flex: 1;
  max-width: 80px;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 2px;
}

/* TOOLBAR */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
}

.toolbar-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.filter-search {
  width: 200px;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #64748b;
}

.dash {
  color: #94a3b8;
  font-size: 12px;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.filter-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.tool-btn {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.tool-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

/* TABLE */
.table-wrap {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.col-id {
  font-family: monospace;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.title-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.solved-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.problem-link {
  font-size: 13px;
  color: #0f172a !important;
  font-weight: 500;
  text-decoration: none;
}

.problem-link:hover {
  color: #2563eb !important;
  text-decoration: underline;
}

.problem-link.solved {
  color: #16a34a !important;
}

.contest-link {
  font-size: 12px;
  color: #64748b !important;
}

.contest-link:hover {
  color: #0f172a !important;
}

.index-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.rating-value {
  font-family: monospace;
  font-size: 13px;
}

.empty-box {
  padding: 30px;
  color: #64748b;
  font-size: 13px;
}

/* PAGINATION */
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .nav-container {
    height: auto;
    padding: 10px 14px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .nav-tabs {
    order: 3;
    width: 100%;
  }
  .summary-metrics-row {
    flex-wrap: wrap;
    gap: 12px 20px;
  }
  .metric-divider {
    display: none;
  }
}

@media (max-width: 600px) {
  .toolbar-filters {
    width: 100%;
  }
  .filter-search {
    width: 100%;
  }
  .toolbar-tools {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
