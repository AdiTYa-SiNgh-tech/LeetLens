import { getSupabase } from "@/lib/supabase";

export interface ProgressService {
  fetchSolvedIds(): Promise<Set<number>>;
  markSolved(problemId: number): Promise<boolean>;
  markUnsolved(problemId: number): Promise<boolean>;
  mergeSolvedIds(
    ids: number[]
  ): Promise<{ added: number; total: number; error: string | null }>;
  exportProgress(): Promise<number[]>;
}

export function createCloudProgressService(): ProgressService | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  return {
    async fetchSolvedIds(): Promise<Set<number>> {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return new Set();
      }

      const { data, error } = await supabase
        .from("user_solved_problems")
        .select("problem_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to fetch cloud solved problems:", error);
        throw new Error(error.message);
      }

      const ids = new Set<number>();
      for (const row of data || []) {
        const num = Number(row.problem_id);
        if (!isNaN(num) && num > 0) {
          ids.add(num);
        }
      }
      return ids;
    },

    async markSolved(problemId: number): Promise<boolean> {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("user_solved_problems").upsert(
        {
          user_id: user.id,
          problem_id: String(problemId),
        },
        { onConflict: "user_id,problem_id" }
      );

      if (error) {
        console.error("Failed to mark problem as solved in cloud:", error);
        throw new Error(error.message);
      }
      return true;
    },

    async markUnsolved(problemId: number): Promise<boolean> {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("user_solved_problems")
        .delete()
        .eq("user_id", user.id)
        .eq("problem_id", String(problemId));

      if (error) {
        console.error("Failed to mark problem as unsolved in cloud:", error);
        throw new Error(error.message);
      }
      return true;
    },

    async mergeSolvedIds(
      ids: number[]
    ): Promise<{ added: number; total: number; error: string | null }> {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return { added: 0, total: 0, error: "User not authenticated" };
      }

      // 1. Fetch current cloud solved IDs
      const currentSolved = await this.fetchSolvedIds();
      const newIdsToInsert = ids.filter(
        (id) => Number.isInteger(id) && id > 0 && !currentSolved.has(id)
      );

      if (newIdsToInsert.length === 0) {
        return { added: 0, total: currentSolved.size, error: null };
      }

      const rows = newIdsToInsert.map((id) => ({
        user_id: user.id,
        problem_id: String(id),
      }));

      // Insert in chunks of 400 rows to prevent payload size limits
      const chunkSize = 400;
      let addedCount = 0;

      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase
          .from("user_solved_problems")
          .upsert(chunk, { onConflict: "user_id,problem_id" });

        if (error) {
          console.error("Error bulk inserting solved problems:", error);
          return {
            added: addedCount,
            total: currentSolved.size + addedCount,
            error: error.message,
          };
        }
        addedCount += chunk.length;
      }

      return {
        added: addedCount,
        total: currentSolved.size + addedCount,
        error: null,
      };
    },

    async exportProgress(): Promise<number[]> {
      const set = await this.fetchSolvedIds();
      return Array.from(set).sort((a, b) => a - b);
    },
  };
}
