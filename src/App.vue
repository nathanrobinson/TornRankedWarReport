<script setup lang="ts">
import { ref } from 'vue'
import UserSettingsForm from './components/UserSettingsForm.vue'
import WarStatsSummary from './components/WarStatsSummary.vue'
import UserStatsTable from './components/UserStatsTable.vue'
import { calculateRewards } from '@/services/rewardCalculator'
import type { RewardSettings } from '@/models/rewardSettings'
import type { WarStats } from '@/models/warStats'
import type { UserStats } from '@/models/userStats'

const warStats = ref<WarStats | null | undefined>(undefined)
const userStats = ref<UserStats[]>([])

async function handleUserSettingsSubmit(data: RewardSettings) {
  // Handle the submitted data as needed
  console.log('User settings submitted:', data)
  const battleLog = await calculateRewards(data)
  userStats.value = battleLog?.userStats ?? []
  warStats.value = battleLog?.warStats
}
</script>

<template>
  <div class="main-flex">
    <div class="side-by-side">
      <UserSettingsForm @submit="handleUserSettingsSubmit" />
      <WarStatsSummary :war-stats="warStats" />
    </div>
    <div class="table-panel">
      <UserStatsTable :users="userStats" />
    </div>
  </div>
</template>

<style lang="scss">
$app-bg: #c8c0c2;

body,
#app {
  background-color: $app-bg;
  min-height: 100vh;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  padding: 0;
  margin: 0;
}
</style>

<style lang="scss" scoped>
.main-flex {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
  padding: 24px 8px;
}

.side-by-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-panel {
  width: 100%;
  min-width: 0;
  flex: 1 1 0;
}

/* Responsive: side by side on large screens */
@media (min-width: 900px) {
  .side-by-side {
    flex-direction: row;
    align-items: flex-start;
  }
  .side-by-side > * {
    flex: 1 1 0;
    min-width: 0;
    max-width: 50%;
  }
}
</style>
