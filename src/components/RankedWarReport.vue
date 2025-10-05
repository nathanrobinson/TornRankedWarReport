<script setup lang="ts">
import { ref } from 'vue'
import UserSettingsForm from './UserSettingsForm.vue'
import WarStatsSummary from './WarStatsSummary.vue'
import UserStatsTable from './UserStatsTable.vue'
import { calculateRewards } from '@/services/rewardCalculator'
import type { RewardSettings } from '@/models/rewardSettings'
import type { WarStats } from '@/models/warStats'
import type { UserStats } from '@/models/userStats'

const warStats = ref<WarStats | null | undefined>(undefined)
const userStats = ref<UserStats[]>([])
const loading = ref(false)

async function handleUserSettingsSubmit(data: RewardSettings) {
  loading.value = true
  try {
    console.log('User settings submitted:', data)
    const battleLog = await calculateRewards(data)
    userStats.value = battleLog?.userStats ?? []
    warStats.value = battleLog?.warStats
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="main-flex">
      <div class="side-by-side">
        <UserSettingsForm @submit="handleUserSettingsSubmit" :loading="loading" />
        <WarStatsSummary :war-stats="warStats" />
      </div>
      <div class="table-panel">
        <UserStatsTable :users="userStats" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables';

.main-flex {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin: 0 auto;
  padding: 0 0.3em;
}

.side-by-side {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
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
