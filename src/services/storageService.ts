export interface LeetLensData {
  version: number;
  appName: string;
  updatedAt: string;
  solvedProblemIds: number[];
  notes?: Record<number, string>;
  preferences?: {
    pageSize?: number;
    locale?: string;
    statusFilter?: string;
  };
}

export interface ImportValidationResult {
  valid: boolean;
  error?: string;
  data?: LeetLensData;
  incomingSolvedCount: number;
}

const STORAGE_KEY = "leetlens_user_data";
const LEGACY_STORAGE_KEY_GUEST = "leetcode_guest_solved_ids";
const LEGACY_STORAGE_KEY_DEFAULT = "leetcode_solved_problem_ids";

/**
 * Validates whether an ID is a valid LeetCode problem identifier.
 */
function isValidProblemId(id: unknown): id is number {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

/**
 * Cleans and deduplicates a list of problem IDs.
 */
function sanitizeIds(ids: unknown[]): number[] {
  const valid = new Set<number>();
  for (const item of ids) {
    if (isValidProblemId(item)) {
      valid.add(Number(item));
    }
  }
  return Array.from(valid).sort((a, b) => a - b);
}

/**
 * Centralized local storage service for LeetLens.
 * Ensures data persistence, migration, corruption resilience, and backup/restore.
 */
export const storageService = {
  /**
   * Loads the full LeetLens data from localStorage.
   * Seamlessly migrates legacy data if found and handles corruption safely.
   */
  loadData(): LeetLensData {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.error("Storage access error:", e);
    }

    let parsedData: LeetLensData | null = null;

    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (
          obj &&
          typeof obj === "object" &&
          Array.isArray(obj.solvedProblemIds)
        ) {
          parsedData = {
            version: obj.version || 2,
            appName: "LeetLens",
            updatedAt: obj.updatedAt || new Date().toISOString(),
            solvedProblemIds: sanitizeIds(obj.solvedProblemIds),
            notes: obj.notes && typeof obj.notes === "object" ? obj.notes : {},
            preferences:
              obj.preferences && typeof obj.preferences === "object"
                ? obj.preferences
                : {},
          };
        }
      } catch (e) {
        console.warn(
          "Corrupted LeetLens storage detected, attempting recovery:",
          e
        );
      }
    }

    // Check for legacy storage keys and migrate
    const legacyIds = this.getLegacySolvedIds();
    if (!parsedData) {
      parsedData = {
        version: 2,
        appName: "LeetLens",
        updatedAt: new Date().toISOString(),
        solvedProblemIds: legacyIds,
        notes: {},
        preferences: {},
      };
      this.saveData(parsedData);
    } else if (legacyIds.length > 0) {
      // Merge any legacy solved IDs that might not be in the primary key
      const currentSet = new Set(parsedData.solvedProblemIds);
      let newlyFound = false;
      for (const id of legacyIds) {
        if (!currentSet.has(id)) {
          currentSet.add(id);
          newlyFound = true;
        }
      }
      if (newlyFound) {
        parsedData.solvedProblemIds = Array.from(currentSet).sort(
          (a, b) => a - b
        );
        parsedData.updatedAt = new Date().toISOString();
        this.saveData(parsedData);
      }
    }

    return parsedData;
  },

  /**
   * Saves the LeetLens data to localStorage.
   */
  saveData(data: LeetLensData): boolean {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
      return false;
    }
  },

  /**
   * Returns a Set of solved problem IDs.
   */
  getSolvedIds(): Set<number> {
    const data = this.loadData();
    return new Set(data.solvedProblemIds);
  },

  /**
   * Updates the set of solved problem IDs.
   */
  setSolvedIds(ids: Set<number>): boolean {
    const data = this.loadData();
    data.solvedProblemIds = Array.from(ids).sort((a, b) => a - b);
    return this.saveData(data);
  },

  /**
   * Toggles the solved state of a single problem ID.
   */
  toggleSolved(problemId: number): {
    isSolved: boolean;
    allSolved: Set<number>;
  } {
    const solvedSet = this.getSolvedIds();
    const isCurrentlySolved = solvedSet.has(problemId);

    if (isCurrentlySolved) {
      solvedSet.delete(problemId);
    } else {
      solvedSet.add(problemId);
    }

    this.setSolvedIds(solvedSet);
    return {
      isSolved: !isCurrentlySolved,
      allSolved: solvedSet,
    };
  },

  /**
   * Completely clears all LeetLens user data from localStorage.
   */
  clearAllData(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY_GUEST);
      localStorage.removeItem(LEGACY_STORAGE_KEY_DEFAULT);
      return true;
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
      return false;
    }
  },

  /**
   * Checks legacy keys (leetcode_guest_solved_ids, leetcode_solved_problem_ids)
   * to ensure no user progress is lost during migration.
   */
  getLegacySolvedIds(): number[] {
    const legacyFound = new Set<number>();
    const keysToCheck = [LEGACY_STORAGE_KEY_GUEST, LEGACY_STORAGE_KEY_DEFAULT];

    for (const key of keysToCheck) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (isValidProblemId(item)) {
                legacyFound.add(Number(item));
              }
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to inspect legacy key ${key}:`, e);
      }
    }

    return Array.from(legacyFound).sort((a, b) => a - b);
  },

  /**
   * Generates a downloadable JSON backup payload with metadata.
   */
  generateBackup(): { filename: string; blob: Blob; jsonString: string } {
    const data = this.loadData();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `leetlens-backup-${dateStr}.json`;

    const exportPayload = {
      version: 2,
      appName: "LeetLens",
      exportedAt: new Date().toISOString(),
      totalSolved: data.solvedProblemIds.length,
      solvedProblemIds: data.solvedProblemIds,
      notes: data.notes || {},
      preferences: {
        ...data.preferences,
        pageSize: localStorage.getItem("pageSize")
          ? Number(localStorage.getItem("pageSize"))
          : undefined,
        locale: localStorage.getItem("locale") || undefined,
      },
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    return { filename, blob, jsonString };
  },

  /**
   * Validates an uploaded JSON backup file string.
   */
  validateBackup(jsonString: string): ImportValidationResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return {
        valid: false,
        error: "invalidJson",
        incomingSolvedCount: 0,
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        valid: false,
        error: "invalidFormat",
        incomingSolvedCount: 0,
      };
    }

    let rawIds: unknown[] = [];
    let notes: Record<number, string> = {};
    let preferences: Record<string, unknown> = {};

    // Support raw array of IDs (version 0 / legacy exports)
    if (Array.isArray(parsed)) {
      rawIds = parsed;
    } else {
      const obj = parsed as Record<string, unknown>;
      // Support { solvedProblemIds: [...] } or { solved_problem_ids: [...] }
      if (Array.isArray(obj.solvedProblemIds)) {
        rawIds = obj.solvedProblemIds;
      } else if (Array.isArray(obj.solved_problem_ids)) {
        rawIds = obj.solved_problem_ids;
      } else if (Array.isArray(obj.problemIds)) {
        rawIds = obj.problemIds;
      } else {
        return {
          valid: false,
          error: "noProblemsFound",
          incomingSolvedCount: 0,
        };
      }

      if (obj.notes && typeof obj.notes === "object") {
        notes = obj.notes as Record<number, string>;
      }
      if (obj.preferences && typeof obj.preferences === "object") {
        preferences = obj.preferences as Record<string, unknown>;
      }
    }

    const sanitized = sanitizeIds(rawIds);

    const validData: LeetLensData = {
      version: 2,
      appName: "LeetLens",
      updatedAt: new Date().toISOString(),
      solvedProblemIds: sanitized,
      notes,
      preferences,
    };

    return {
      valid: true,
      data: validData,
      incomingSolvedCount: sanitized.length,
    };
  },

  /**
   * Imports validated backup data, either replacing or merging with current progress.
   */
  applyImport(
    importedData: LeetLensData,
    mode: "merge" | "replace" = "merge"
  ): { success: boolean; added: number; total: number } {
    const current = this.loadData();
    let finalIds: number[] = [];
    let addedCount = 0;

    if (mode === "replace") {
      finalIds = importedData.solvedProblemIds;
      addedCount = finalIds.length;
    } else {
      // Merge mode
      const set = new Set(current.solvedProblemIds);
      for (const id of importedData.solvedProblemIds) {
        if (!set.has(id)) {
          set.add(id);
          addedCount++;
        }
      }
      finalIds = Array.from(set).sort((a, b) => a - b);
    }

    current.solvedProblemIds = finalIds;
    current.updatedAt = new Date().toISOString();
    if (importedData.notes) {
      current.notes = { ...current.notes, ...importedData.notes };
    }

    const saved = this.saveData(current);
    return {
      success: saved,
      added: addedCount,
      total: finalIds.length,
    };
  },
};
