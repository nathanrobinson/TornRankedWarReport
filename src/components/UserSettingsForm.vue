<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RewardSettings } from '@/models/rewardSettings'

const apiKey = ref('')
const attackRewards = ref('')
const assistRewards = ref('')
const medOutRewards = ref('')
const reviveRewards = ref('')
const minMedOuts = ref('10') // Default to 10

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
    reviveRewards: parseNumber(reviveRewards.value),
    payoutType: payoutType.value,
    ignoreChainBonus: ignoreChainBonusEnabled.value ? ignoreChainBonus.value : false,
    minMedOuts: parseNumber(minMedOuts.value),
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="apiKey">Torn Limited API Key:</label>
      <input id="apiKey" v-model="apiKey" type="password" required />
    </div>
    <div>
      <label for="attackRewards">Attack Rewards:</label>
      <input id="attackRewards" v-model="attackRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="assistRewards">Assist Rewards:</label>
      <input id="assistRewards" v-model="assistRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="medOutRewards">Med Out Rewards:</label>
      <input id="medOutRewards" v-model="medOutRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="reviveRewards">Revive Rewards:</label>
      <input id="reviveRewards" v-model="reviveRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="minMedOuts">Minimum Med Outs:</label>
      <input id="minMedOuts" v-model="minMedOuts" type="number" min="0" />
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
        Exclude Chain Bonus
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
$form-input-bg: #fff4f6;
$form-input-focus: $accent;
$form-btn-bg: $accent;
$form-btn-hover: color.adjust($accent, $lightness: 10%);
$form-btn-text: #fff;
$form-box-shadow-color: color.change($accent, $alpha: 0.08);

form {
  background: $form-bg;
  border: 2px solid $form-border;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;

  padding: 14px 16px 10px 16px;
  max-width: 540px;
  margin: 12px auto 16px auto;
  box-shadow: 0 2px 16px $form-box-shadow-color;
  overflow-x: auto;
  word-break: break-word;
}

label {
  color: $form-label;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

input[type='text'],
input[type='password'],
select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid $primary;
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
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(209, 16, 51, 0.08);
  &:hover {
    background: $form-btn-hover;
  }
}

@media (max-width: 899px) {
  form {
    max-width: 90vw;
    width: 90vw;
  }
}
</style>
