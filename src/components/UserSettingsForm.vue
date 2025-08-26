<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RewardSettings } from '@/models/rewardSettings'

const apiKey = ref('')
const attackRewards = ref('')
const assistRewards = ref('')
const medOutRewards = ref('')
const reviveRewards = ref('')
const chainBuilderRewards = ref('')
const minMedOuts = ref('10')

// Add payoutType and ignoreChainBonus
const payoutType = ref<'perAttack' | 'perRespect'>('perRespect')
const ignoreChainBonus = ref(true)
const includeChainBuilders = ref(false)

function parseNumber(value: string): number {
  const normalized = String(value).replace(/[^0-9]/g, '')
  return Number(normalized)
}

const emit = defineEmits<{
  (e: 'submit', data: RewardSettings): void
}>()

// Only enable ignoreChainBonus if payoutType is perRespect
const ignoreChainBonusEnabled = computed(() => payoutType.value === 'perRespect')
const includeChainBuildersEnabled = computed(() => payoutType.value === 'perAttack')

function handleSubmit() {
  if (apiKey.value) {
    emit('submit', {
      apiKey: apiKey.value,
      attackRewards: parseNumber(attackRewards.value),
      assistRewards: parseNumber(assistRewards.value),
      medOutRewards: parseNumber(medOutRewards.value),
      reviveRewards: parseNumber(reviveRewards.value),
      chainBuilderRewards: parseNumber(chainBuilderRewards.value),
      payoutType: payoutType.value,
      ignoreChainBonus: ignoreChainBonusEnabled.value ? ignoreChainBonus.value : false,
      includeChainBuilders: includeChainBuildersEnabled.value ? includeChainBuilders.value : false,
      minMedOuts: parseNumber(minMedOuts.value),
    })
  }
}

const helpOpen = ref<string | null>(null)

const helpTexts: Record<string, string> = {
  apiKey:
    'Your Torn API key with at least limited access. This is required to fetch war and member data. The key is not saved or transmitted anywhere except to the torn api.',
  attackRewards:
    'Total amount of money to distribute for attacks or respect, depending on payout type.',
  assistRewards: 'Total amount of money to distribute for assists.',
  medOutRewards: 'Total amount of money to distribute for med outs (hospitalizes).',
  minMedOuts:
    'The minimum number of med outs a player must have to be eligible for med out rewards.',
  reviveRewards: 'Total amount of money to distribute for revives.',
  chainBuilderRewards:
    'If set, attacks that build a chain but do not contribute respect will receive a pro-rated reward.',
  payoutType: 'Choose whether attack rewards are distributed per attack or per respect earned.',
  ignoreChainBonus:
    'If checked, attacks with a special chain bonus will be calculated at 10 respect instead of the bonus amount.',
  includeChainBuilders:
    'If checked, attacks that are part of a chain but do not contribute respect to the war will be included in payouts. This should not be checked if you are using the Chain Builder Rewards for a separate payout pool or if you only want to include War hits.',
}

function showHelp(key: string) {
  helpOpen.value = key
}
function hideHelp(key: string) {
  if (helpOpen.value === key) helpOpen.value = null
}

const props = defineProps<{
  loading?: boolean
}>()
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="apiKey">
        Torn Limited API Key:
        <span
          class="help-icon"
          @mouseenter="showHelp('apiKey')"
          @mouseleave="hideHelp('apiKey')"
          @click="helpOpen === 'apiKey' ? hideHelp('apiKey') : showHelp('apiKey')"
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'apiKey'" class="help-popup">{{ helpTexts.apiKey }}</span>
      </label>
      <input id="apiKey" v-model="apiKey" type="password" required />
    </div>
    <div>
      <label for="attackRewards">
        Attack Rewards:
        <span
          class="help-icon"
          @mouseenter="showHelp('attackRewards')"
          @mouseleave="hideHelp('attackRewards')"
          @click="
            helpOpen === 'attackRewards' ? hideHelp('attackRewards') : showHelp('attackRewards')
          "
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'attackRewards'" class="help-popup">{{
          helpTexts.attackRewards
        }}</span>
      </label>
      <input id="attackRewards" v-model="attackRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label>
        Payout Type:
        <span
          class="help-icon"
          @mouseenter="showHelp('payoutType')"
          @mouseleave="hideHelp('payoutType')"
          @click="helpOpen === 'payoutType' ? hideHelp('payoutType') : showHelp('payoutType')"
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'payoutType'" class="help-popup">{{ helpTexts.payoutType }}</span>
      </label>
      <div class="select-wrapper">
        <select v-model="payoutType">
          <option value="perAttack">Per Attack</option>
          <option value="perRespect">Per Respect</option>
        </select>
      </div>
    </div>
    <div v-if="includeChainBuildersEnabled">
      <label>
        <input type="checkbox" v-model="includeChainBuilders" />
        <span class="label"
          >Include chain builders with war hits
          <span
            class="help-icon"
            @mouseenter="showHelp('includeChainBuilders')"
            @mouseleave="hideHelp('includeChainBuilders')"
            @click="
              helpOpen === 'includeChainBuilders'
                ? hideHelp('includeChainBuilders')
                : showHelp('includeChainBuilders')
            "
            tabindex="0"
            >?</span
          ></span
        >
        <span v-if="helpOpen === 'includeChainBuilders'" class="help-popup">{{
          helpTexts.includeChainBuilders
        }}</span>
      </label>
    </div>
    <div v-if="ignoreChainBonusEnabled">
      <label>
        <input type="checkbox" v-model="ignoreChainBonus" />
        <span class="label"
          >Exclude Chain Bonus
          <span
            class="help-icon"
            @mouseenter="showHelp('ignoreChainBonus')"
            @mouseleave="hideHelp('ignoreChainBonus')"
            @click="
              helpOpen === 'ignoreChainBonus'
                ? hideHelp('ignoreChainBonus')
                : showHelp('ignoreChainBonus')
            "
            tabindex="0"
            >?</span
          ></span
        >
        <span v-if="helpOpen === 'ignoreChainBonus'" class="help-popup">{{
          helpTexts.ignoreChainBonus
        }}</span>
      </label>
    </div>
    <div>
      <label for="assistRewards">
        Assist Rewards:
        <span
          class="help-icon"
          @mouseenter="showHelp('assistRewards')"
          @mouseleave="hideHelp('assistRewards')"
          @click="
            helpOpen === 'assistRewards' ? hideHelp('assistRewards') : showHelp('assistRewards')
          "
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'assistRewards'" class="help-popup">{{
          helpTexts.assistRewards
        }}</span>
      </label>
      <input id="assistRewards" v-model="assistRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="medOutRewards">
        Med Out Rewards:
        <span
          class="help-icon"
          @mouseenter="showHelp('medOutRewards')"
          @mouseleave="hideHelp('medOutRewards')"
          @click="
            helpOpen === 'medOutRewards' ? hideHelp('medOutRewards') : showHelp('medOutRewards')
          "
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'medOutRewards'" class="help-popup">{{
          helpTexts.medOutRewards
        }}</span>
      </label>
      <input id="medOutRewards" v-model="medOutRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="minMedOuts">
        Minimum Med Outs:
        <span
          class="help-icon"
          @mouseenter="showHelp('minMedOuts')"
          @mouseleave="hideHelp('minMedOuts')"
          @click="helpOpen === 'minMedOuts' ? hideHelp('minMedOuts') : showHelp('minMedOuts')"
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'minMedOuts'" class="help-popup">{{ helpTexts.minMedOuts }}</span>
      </label>
      <input id="minMedOuts" v-model="minMedOuts" type="number" min="0" />
    </div>
    <div>
      <label for="reviveRewards">
        Revive Rewards:
        <span
          class="help-icon"
          @mouseenter="showHelp('reviveRewards')"
          @mouseleave="hideHelp('reviveRewards')"
          @click="
            helpOpen === 'reviveRewards' ? hideHelp('reviveRewards') : showHelp('reviveRewards')
          "
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'reviveRewards'" class="help-popup">{{
          helpTexts.reviveRewards
        }}</span>
      </label>
      <input id="reviveRewards" v-model="reviveRewards" type="text" inputmode="decimal" />
    </div>
    <div>
      <label for="chainBuilderRewards">
        Chain Builder Rewards:
        <span
          class="help-icon"
          @mouseenter="showHelp('chainBuilderRewards')"
          @mouseleave="hideHelp('chainBuilderRewards')"
          @click="
            helpOpen === 'chainBuilderRewards'
              ? hideHelp('chainBuilderRewards')
              : showHelp('chainBuilderRewards')
          "
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'chainBuilderRewards'" class="help-popup">{{
          helpTexts.chainBuilderRewards
        }}</span>
      </label>
      <input
        id="chainBuilderRewards"
        v-model="chainBuilderRewards"
        type="text"
        inputmode="decimal"
      />
    </div>
    <button type="submit" :disabled="props.loading">
      <span v-if="props.loading" class="spinner" aria-label="Loading"></span>
      <span v-else>Submit</span>
    </button>
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
$form-box-shadow-color: color.adjust($accent, $lightness: -30%);

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
  overflow-x: auto;
  word-break: break-word;
}

label {
  position: relative;
  color: $form-label;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

select,
input[type='checkbox'],
input[type='radio'] {
  appearance: none;
  -webkit-appearance: none; /* For older WebKit browsers */
  -moz-appearance: none; /* For older Firefox browsers */
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '▼'; /* Unicode character for a down arrow */
  color: $accent;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Allows clicks to pass through to the select */
}

.select-wrapper:hover:after {
  color: $primary;
}

input[type='text'],
input[type='password'],
input[type='number'],
select {
  width: 100%;
}

input,
select {
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
  &:focus,
  &:hover,
  &:active {
    border-color: $accent;
    outline: 0;
  }
}

input[type='checkbox'] {
  margin-right: 8px;
  padding: 10px 8px;
  width: 45px;
  height: 45px;
}

input[type='checkbox']::after {
  content: '　';
  position: relative;
  display: inline-block;
  color: #2d3047;
  font-size: 31px;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
}
input[type='checkbox']:checked:after {
  content: '✓';
}
span.label {
  margin-top: -2px;
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
  position: relative;
  &:hover {
    background: $form-btn-hover;
  }
}

.spinner {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border: 2.5px solid #fff;
  border-top: 2.5px solid $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.help-icon {
  display: inline-block;
  margin-left: 6px;
  color: #fff;
  background: $accent;
  border: 1px solid $primary;
  border-radius: 50%;
  padding: 2px 5px;
  cursor: pointer;
  font-size: 8pt;
  vertical-align: middle;
  user-select: none;
  position: relative;
}

.help-popup {
  position: absolute;
  z-index: 10;
  background: $form-input-bg;
  color: $accent;
  font-weight: 100;
  font-style: italic;
  border: 1.5px solid $accent;
  border-radius: 8px;
  padding: 5px 7px;
  min-width: 220px;
  max-width: 320px;
  font-size: 0.98em;
  box-shadow: 0 2px 12px $form-box-shadow-color;
  white-space: normal;
  pointer-events: none;
}

@media (max-width: 899px) {
  form {
    max-width: 90vw;
    width: 90vw;
  }
}
</style>
