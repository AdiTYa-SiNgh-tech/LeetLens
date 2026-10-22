<template>
  <div class="distribution-panel">
    <div class="panel-header">
      <span class="panel-title">{{ $t("difficultyDistribution") }}</span>
    </div>

    <div class="distribution-grid">
      <div v-for="tier in tiers" :key="tier.nameKey" class="tier-item">
        <div class="tier-label-row">
          <span class="tier-name">{{ $t(tier.nameKey) }}</span>
          <span class="tier-numbers">
            <strong>{{ tier.solved }}</strong> / {{ tier.total }}
            <span class="tier-percent">({{ tier.percentage }}%)</span>
          </span>
        </div>
        <div class="tier-bar-bg">
          <div
            class="tier-bar-fill"
            :style="{
              width: `${tier.percentage}%`,
              backgroundColor: tier.color,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Problem {
  ID: number;
  Rating: number;
}

const props = defineProps<{
  problems: Array<Problem>;
  solvedSet: Set<number>;
}>();

const tiers = computed(() => {
  const definitions = [
    { nameKey: "tierEasy", min: 0, max: 1399, color: "#16a34a" },
    { nameKey: "tierMedium", min: 1400, max: 1799, color: "#2563eb" },
    { nameKey: "tierHard", min: 1800, max: 2199, color: "#d97706" },
    { nameKey: "tierExpert", min: 2200, max: 9999, color: "#dc2626" },
  ];

  return definitions.map((def) => {
    let total = 0;
    let solved = 0;

    for (const p of props.problems) {
      const r = Math.round(p.Rating);
      if (r >= def.min && r <= def.max) {
        total++;
        if (props.solvedSet.has(p.ID)) {
          solved++;
        }
      }
    }

    const percentage =
      total > 0 ? Number(((solved / total) * 100).toFixed(1)) : 0;
    return {
      ...def,
      total,
      solved,
      percentage,
    };
  });
});
</script>

<style scoped>
.distribution-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 10px;
  margin-bottom: 16px;
}

.panel-header {
  margin-bottom: 8px;
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.tier-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tier-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}

.tier-name {
  font-weight: 500;
  color: #334155;
}

.tier-numbers {
  color: #64748b;
  font-size: 12px;
}

.tier-numbers strong {
  color: #0f172a;
}

.tier-percent {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 2px;
}

.tier-bar-bg {
  width: 100%;
  height: 4px;
  background-color: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.tier-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
