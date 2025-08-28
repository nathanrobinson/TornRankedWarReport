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
const loading = ref(false)

async function handleUserSettingsSubmit(data: RewardSettings) {
  loading.value = true
  try {
    // Handle the submitted data as needed
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
  <h1>Torn Ranked War Report</h1>
  <div class="main-flex">
    <div class="side-by-side">
      <UserSettingsForm @submit="handleUserSettingsSubmit" :loading="loading" />
      <WarStatsSummary :war-stats="warStats" />
    </div>
    <div class="table-panel">
      <UserStatsTable :users="userStats" />
    </div>
  </div>
  <footer class="footer">
    <span class="primary">Torn Ranked War Report</span> provided by
    <a href="https://www.torn.com/profiles.php?XID=3733696">TheDawgLives</a>
  </footer>
</template>

<style lang="scss">
@use '@/styles/variables';

body,
#app {
  background-color: variables.$app-bg;
  min-height: 100vh;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  padding: 0;
  margin: 0;
}
</style>

<style lang="scss" scoped>
@use '@/styles/variables';

h1 {
  color: variables.$primary;
}

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

footer {
  font-weight: 100;
  font-size: 85%;
  text-align: center;

  .primary {
    color: variables.$primary;
  }

  a {
    color: variables.$accent;
    text-decoration: none;
  }
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
