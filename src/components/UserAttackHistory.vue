<script setup lang="ts">
import { ref } from 'vue'
import UserAttackSettings from './UserAttackSettings.vue'
import UserAttackResults from './UserAttackResults.vue'
import UserMugResults from './UserMugResults.vue'
import { getMugs, getUserAttacks } from '@/services/userAttackService'
import type { WeightedUserAttack } from '@/services/userAttackService'
import type { UserMug } from '@/services/userAttackService'

const attacks = ref<WeightedUserAttack[]>([])
const totals = ref<{ [result: string]: number } | null>(null)
const mugs = ref<UserMug[]>([]);
const mugTotals = ref<{ mugs: number; totalMugged: number } | null>(null)
const loading = ref(false)
const showMugReport = ref(false)

async function onSearch(payload: { apiKey: string; numAttacks: number, showMugReport: boolean }) {
  loading.value = true
  try {
    showMugReport.value = payload.showMugReport
    if (!showMugReport.value) {
      const res = await getUserAttacks(payload.apiKey, payload.numAttacks)
      attacks.value = res.attacks
      totals.value = res.totals
    } else {
      const res = await getMugs(payload.apiKey, payload.numAttacks)
      mugs.value = res.attacks
      mugTotals.value = res.totals
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UserAttackSettings @search="onSearch" :loading="loading" />
  <UserAttackResults v-if="!showMugReport" :attacks="attacks" :totals="totals" :loading="loading" />
  <UserMugResults v-if="showMugReport" :mugs="mugs" :totals="mugTotals" :loading="loading" />
</template>

<style scoped lang="scss">
@use '@/styles/variables';
</style>
