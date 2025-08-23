<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RewardSettings } from '@/models/rewardSettings'

const apiKey = ref('')
const attackRewards = ref('')
const assistRewards = ref('')
const medOutRewards = ref('')

// Add payoutType and ignoreChainBonus
const payoutType = ref<'perAttack' | 'perRespect'>('perRespect')
const ignoreChainBonus = ref(true)

function parseNumber(value: string): number {
  const normalized = value.replace(/,\./g, '').replace(/[^0-9]/g, '')
  return Number(normalized)
}

const emit = defineEmits<{
  (e: 'submit', data: RewardSettings): void
}>()

// Only enable ignoreChainBonus if payoutType is perRespect
const ignoreChainBonusEnabled = computed(() => payoutType.value === 'perRespect')

function handleSubmit() {
  emit('submit', {
    apiKey: apiKey.value,
    attackRewards: parseNumber(attackRewards.value),
    assistRewards: parseNumber(assistRewards.value),
    medOutRewards: parseNumber(medOutRewards.value),
    payoutType: payoutType.value,
    ignoreChainBonus: ignoreChainBonusEnabled.value ? ignoreChainBonus.value : false,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="apiKey">Torn Limited API Key:</label>
      <input id="apiKey" v-model="apiKey" type="text" required />
    </div>
    <div>
      <label for="attackRewards">Attack Rewards:</label>
      <input id="attackRewards" v-model="attackRewards" type="text" inputmode="decimal" required />
    </div>
    <div>
      <label for="assistRewards">Assist Rewards:</label>
      <input id="assistRewards" v-model="assistRewards" type="text" inputmode="decimal" required />
    </div>
    <div>
      <label for="medOutRewards">Med Out Rewards:</label>
      <input id="medOutRewards" v-model="medOutRewards" type="text" inputmode="decimal" required />
    </div>
    <div>
      <label>Payout Type:</label>
      <select v-model="payoutType">
        <option value="perAttack">Per Attack</option>
        <option value="perRespect">Per Respect</option>
      </select>
    </div>
    <div>
      <label>
        <input type="checkbox" v-model="ignoreChainBonus" :disabled="!ignoreChainBonusEnabled" />
        Ignore Chain Bonus
      </label>
    </div>
    <button type="submit">Submit</button>
  </form>
</template>

<style lang="scss" scoped>
@use 'sass:color';

$primary: #b5112f;
$accent: #2d3047;
$form-bg: #fff;
$form-border: $accent;
$form-label: $primary;
$form-input-bg: #f8f9fa;
$form-input-focus: $accent;
$form-btn-bg: $accent;
$form-btn-hover: color.adjust($accent, $lightness: 10%);
$form-btn-text: #fff;

form {
  background: $form-bg;
  border: 2px solid $form-border;
  border-radius: 12px;
  padding: 32px 28px 24px 28px;
  max-width: 480px;
  margin: 32px auto 24px auto;
  box-shadow: 0 2px 16px rgba(45, 48, 71, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
}

label {
  color: $form-label;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

input[type='text'],
select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  background: $form-input-bg;
  font-size: 1rem;
  margin-top: 4px;
  margin-bottom: 2px;
  transition: border-color 0.2s;
  min-width: 0;
  overflow: hidden;
  &:focus {
    border-color: $form-input-focus;
    outline: none;
  }
}

input[type='checkbox'] {
  accent-color: $primary;
  margin-right: 8px;
}

button[type='submit'] {
  background: $form-btn-bg;
  color: $form-btn-text;
  border: none;
  border-radius: 6px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(209, 16, 51, 0.08);
  &:hover {
    background: $form-btn-hover;
  }
}
</style>
