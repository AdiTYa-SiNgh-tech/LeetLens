<template>
  <div class="distribution-panel">
    <div class="panel-header">
      <div class="header-left">
        <span class="panel-title">{{ $t("difficultyDistribution") }}</span>
      </div>
      <div class="header-right">
        <span class="panel-subtitle">
          {{ solvedSet.size }} {{ $t("solvedCount").toLowerCase() }}
        </span>
      </div>
    </div>

    <div class="distribution-grid">
      <div v-for="tier in tiers" :key="tier.nameKey" class="tier-card">
        <div class="tier-top">
          <div class="tier-title-wrap">
            <span
              class="tier-indicator"
              :style="{ backgroundColor: tier.color }"
            ></span>
            <span class="tier-name">{{ $t(tier.nameKey) }}</span>
          </div>
          <span class="tier-percentage">{{ tier.percentage }}%</span>
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

        <div class="tier-bottom">
          <span class="tier-numbers">
            <span class="tier-solved">{{ tier.solved }}</span>
            <span class="tier-total">/ {{ tier.total }}</span>
          </span>
          <span class="tier-range">{{ tier.rangeLabel }}</span>
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
    {
      nameKey: "tierEasy",
      min: 0,
      max: 1399,
      color: "#16a34a",
      rangeLabel: "< 1400",
    },
    {
      nameKey: "tierMedium",
      min: 1400,
      max: 1799,
      color: "#2563eb",
      rangeLabel: "1400 - 1799",
    },
    {
      nameKey: "tierHard",
      min: 1800,
      max: 2199,
      color: "#d97706",
      rangeLabel: "1800 - 2199",
    },
    {
      nameKey: "tierExpert",
      min: 2200,
      max: 9999,
      color: "#dc2626",
      rangeLabel: "2200+",
    },
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
  border-radius: 8px;
  padding: 14px 18px;
  margin-top: 10px;
  margin-bottom: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-title {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.panel-subtitle {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .distribution-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .distribution-grid {
    grid-template-columns: 1fr;
  }
}

.tier-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.tier-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.tier-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tier-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tier-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tier-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
}

.tier-percentage {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  font-variant-numeric: tabular-nums;
}

.tier-bar-bg {
  width: 100%;
  height: 5px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.tier-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.tier-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #64748b;
  margin-top: 1px;
}

.tier-solved {
  font-weight: 600;
  color: #0f172a;
}

.tier-total {
  color: #94a3b8;
  margin-left: 2px;
}

.tier-range {
  font-size: 11px;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
