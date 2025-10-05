<script setup lang="ts">
import { ref } from 'vue'
import UserAttackSettings from './UserAttackSettings.vue'
import UserAttackResults from './UserAttackResults.vue'
import { getUserAttacks } from '@/services/userAttackService'
import type { WeightedUserAttack } from '@/services/userAttackService'

const attacks = ref<WeightedUserAttack[]>([])
const totals = ref<{ [result: string]: number } | null>(null)
const loading = ref(false)

async function onSearch(payload: { apiKey: string; numAttacks: number }) {
  loading.value = true
  try {
    const res = await getUserAttacks(payload.apiKey, payload.numAttacks)
    attacks.value = res.attacks
    totals.value = res.totals
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UserAttackSettings @search="onSearch" :loading="loading" />
    <UserAttackResults :attacks="attacks" :totals="totals" :loading="loading" />
</template>

<style scoped lang="scss">
@use '@/styles/variables';
</style>
