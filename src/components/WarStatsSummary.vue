<script setup lang="ts">
import { computed } from 'vue'
import type { WarStats } from '@/models/warStats'

const props = defineProps<{
  warStats: WarStats | undefined | null
}>()

const rankedWarUrl = computed(
  () => `https://www.torn.com/factions.php?step=rankedwar&ID=${props.warStats?.rankedWarId}`,
)

function formatCurrency(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '-'
  return val.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
</script>

<template>
  <div id="warStats">
    <h2>
      <span class="primary">{{ warStats?.factionName }}</span>
    </h2>
    <div>
      <span>Ranked War ID:</span>
      <a :href="rankedWarUrl" target="_blank" rel="noopener">
        <span class="primary">{{ warStats?.rankedWarId }}</span>
      </a>
      <span
        >vs <span class="primary">{{ warStats?.opponentName }}</span></span
      >
    </div>
    <div>
      <span>Total Number of Attacks:</span>
      <span class="primary">{{ warStats?.totalAttacks }}</span>
      <span v-if="warStats?.rewardPerAttack !== null">$/:</span>
      <span class="primary" v-if="warStats?.rewardPerAttack !== null">{{
        formatCurrency(warStats?.rewardPerAttack)
      }}</span>
    </div>
    <div>
      <span>Total Respect Earned:</span>
      <span class="primary">{{ warStats?.totalRespect }}</span>
      <span v-if="warStats?.rewardPerRespect !== null">$/:</span>
      <span class="primary" v-if="warStats?.rewardPerRespect !== null">{{
        formatCurrency(warStats?.rewardPerRespect)
      }}</span>
    </div>
    <div>
      <span>Total Number of Assists:</span>
      <span class="primary">{{ warStats?.totalAssists }}</span>
      <span>$/:</span>
      <span class="primary">{{ formatCurrency(warStats?.rewardPerAssist) }}</span>
    </div>
    <div>
      <span>Total Number of Med Outs:</span>
      <span class="primary">{{ warStats?.totalMedOuts }}</span>
      <span>$/:</span>
      <span class="primary">{{ formatCurrency(warStats?.rewardPerMedOut) }}</span>
    </div>
    <div>
      <span>Total Number of Revives:</span>
      <span class="primary">{{ warStats?.totalRevives }}</span>
      <span>$/:</span>
      <span class="primary">{{ formatCurrency(warStats?.rewardPerRevive) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$primary: #b5112f;
$accent: #2d3047;
$card-bg: #fff;
$card-border: $accent;
$card-title: $primary;
$card-label: $accent;
$card-value: #222;
$link-color: $primary;
$link-hover: $accent;

div,
form {
  background: $card-bg;
  border: 2px solid $card-border;
  border-radius: 12px;
  padding: 14px 16px 10px 16px;
  max-width: 540px;
  margin: 12px auto 16px auto;
  box-shadow: 0 2px 16px rgba(45, 48, 71, 0.08);
  overflow-x: auto;
  word-break: break-word;
}

h2 {
  color: $card-title;
  font-size: 2rem;
  font-weight: 800;
  margin: 12px 0 18px 12px;
  letter-spacing: 0.03em;
  word-break: break-word;
}

a {
  color: $link-color;
  text-decoration: underline;
  font-weight: 600;
  word-break: break-all;
  &:hover {
    color: $link-hover;
  }
}

#warStats > div {
  margin-bottom: 10px;
  font-size: 1.08rem;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  word-break: break-word;
}

#warStats > div > span:first-child {
  color: $card-label;
  font-weight: 600;
  min-width: 180px;
  display: inline-block;
  word-break: break-word;
}

#warStats > div {
  color: $card-value;
  font-weight: 500;
  word-break: break-word;
}

.primary {
  color: $primary;
  font-weight: 600;
}
</style>
