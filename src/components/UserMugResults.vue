<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { UserMug } from '@/services/userAttackService'

const props = defineProps<{ mugs: UserMug[]; totals?: { mugs: number; totalMugged: number } | null; }>()

// Filters
const minMugged = ref(50000)

// Sorting
const sortKey = ref<'defender' | 'timestamp' | 'amount' | 'timesMugged'>('amount')
const sortDir = ref<'asc' | 'desc'>('desc')

function setSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

// Columns definition (for header, widths, and resize handles)
const columns = ref([
  { key: 'defender', label: 'Defender', width: 260 },
  { key: 'timestamp', label: 'Last Attack', width: 80 },
  { key: 'amount', label: 'Last Mugged Amount', width: 140 },
  { key: 'timesMugged', label: 'Times Mugged', width: 50 },
  { key: 'link', label: 'Log', width: 300 },
])

// Resizing logic (copied/adapted from UserStatsTable)
const resizing = reactive({
  colIdx: null as number | null,
  startX: 0,
  startWidth: 0,
})
function onResizeMouseDown(e: MouseEvent, idx: number) {
  resizing.colIdx = idx
  resizing.startX = e.clientX
  resizing.startWidth = columns.value[idx]?.width ?? 0
  document.addEventListener('mousemove', onResizeMouseMove)
  document.addEventListener('mouseup', onResizeMouseUp)
}
function onResizeMouseMove(e: MouseEvent) {
  if (resizing.colIdx === null || !columns.value[resizing.colIdx]) return
  const dx = e.clientX - resizing.startX
  const newWidth = Math.max(40, resizing.startWidth + dx)
  // @ts-expect-error narrow dynamic assignment for column width
  columns.value[resizing.colIdx].width = newWidth
}
function onResizeMouseUp() {
  resizing.colIdx = null
  document.removeEventListener('mousemove', onResizeMouseMove)
  document.removeEventListener('mouseup', onResizeMouseUp)
}

const filtered = computed(() => {
  return (props.mugs || []).filter((a) => a.amount >= minMugged.value)
})

const sorted = computed(() => {
  const arr = [...filtered.value]
  const key = sortKey.value
  const dir = sortDir.value
  arr.sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0
    switch (key) {
      case 'timestamp':
        aVal = a.timestamp
        bVal = b.timestamp
        break
      case 'amount':
        aVal = a.amount
        bVal = b.amount
        break
      case 'timesMugged':
        aVal = a.timesMugged
        bVal = b.timesMugged
        break
      case 'defender':
      default:
        aVal = a.defender
        bVal = b.defender
    }

    return dir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })
  return arr
})

function exportCSV() {
  const headers = ['DefenderId', 'Timestamp', 'Amount', 'Times Mugged', 'Link']
  const rows = sorted.value.map((a) => [String(a.defender), String(a.timestamp), String(a.amount), String(a.amount), String(a.link)])
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'user_attack_results.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function formatUnixTimestampToLocalDate(unixTimestamp: number) {
  // Unix timestamps are in seconds, JavaScript Date expects milliseconds
  const date = new Date(unixTimestamp * 1000);

  // Format the date and time in the user's local format
  // Options can be customized for specific formatting needs
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  return date.toLocaleString(undefined, options); // 'undefined' uses default locale
}

function timeAgo(unixTimestamp: number) {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  const seconds = now - unixTimestamp;

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (seconds < 2592000) { // Approx 30 days
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    // For older dates, return the full local date/time
    return formatUnixTimestampToLocalDate(unixTimestamp);
  }
}

function formatAmount(amount: number) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0, // Ensures no decimal places are displayed
    maximumFractionDigits: 0  // Ensures no decimal places are displayed
  });

  return formatter.format(amount);
}

///loader.php?sid=attackLog&ID=xxx
function formatLink(link: string) {
  const id = link.replace(/^.*loader.php\?sid=attackLog&ID=/, '').replace(/"target.*$/, '')

  return `https://www.torn.com/loader.php?sid=attackLog&ID=${id}`
}

function getMugTimeClass(attack: UserMug) {
  let timeBucket = 0
  let valueBucket = 0
  const now = Math.floor(Date.now() / 1000)
  const TwentyHours = 60 * 60 * 20
  const TwentyFourHours = 60 * 60 * 24

  if ((attack.timestamp + TwentyHours) < now) {
    timeBucket = 1
  }
  if ((attack.timestamp + TwentyFourHours) < now) {
     timeBucket = 2
  }

  if (attack.amount > 100000) {
    valueBucket = 1
  }
  if (attack.amount > 200000) {
    valueBucket = 2
  }
  if (attack.amount > 500000) {
    valueBucket = 3
  }
  if (attack.amount > 750000) {
    valueBucket = 4
  }

  return `mug-row-${valueBucket}-${timeBucket}`;
}

</script>

<template>

  <div v-if="!props.mugs || props.mugs.length === 0" class="empty">No mugs found.</div>

  <div v-else class="attack-results">
    <h2>User Mug Results</h2>

      <div v-if="props.totals" class="totals">
        <div class="total-card">Total Attacks: {{ props.totals.mugs }}</div>
        <div class="total-card">Total Mugged: {{ props.totals.totalMugged }}</div>
      </div>

      <div class="controls">
        <button class="btn-primary" @click="exportCSV">Export Spreadsheet</button>
        <div class="spacer"></div>
        <label class="input-small">
          Min mugged
          <input type="number" v-model.number="minMugged" step="1000" min="0" />
        </label>
      </div>

    <div class="table-scroll-wrapper">
      <div class="table-outer-scroll">
        <table>
          <thead>
            <tr>
              <th v-for="(col, idx) in columns" :key="col.key" :style="{ width: col.width + 'px', position: 'relative' }" @click.prevent="setSort(col.key as any)" class="sortable">
                <span class="th-content">{{ col.label }}</span>
                <span v-if="sortKey === col.key" class="sort-key">
                  <span v-if="sortDir === 'asc'">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
                <span class="resize-handle" @mousedown.stop.prevent="onResizeMouseDown($event, idx)" title="Drag to resize"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attack in sorted" :key="attack.timestamp" :class="getMugTimeClass(attack)">
              <td v-for="col in columns" :key="col.key">
                <template v-if="col.key === 'defender'">
                  [<a :href="`https://www.torn.com/profiles.php?XID=${attack.defender}`" target="_player">{{ attack.defender }}</a>]
                  <a :href="`https://www.torn.com/loader.php?sid=attack&user2ID=${attack.defender}`" target="_attack">⚔️</a>
                </template>
                <template v-else-if="col.key === 'timestamp'">{{ formatUnixTimestampToLocalDate(attack.timestamp) }} ({{ timeAgo(attack.timestamp) }})</template>
                <template v-else-if="col.key === 'amount'">{{ formatAmount(attack.amount) }}</template>
                <template v-else-if="col.key === 'timesMugged'">{{ attack.timesMugged }}</template>
                <template v-else-if="col.key === 'link'"><a :href="formatLink(attack.link)" target="_log">view</a></template>
                <template v-else>{{ (attack as any)[col.key] }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/styles/variables';
@use '@/styles/input' as inputStyles;

.attack-results {
  h2 {
    color: variables.$primary;
    margin-bottom: 8px;
  }

  .controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .controls .btn-primary {
    background: variables.$accent;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 10px 24px;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 18px;
    cursor: pointer;
    transition: background-color 0.2s;
    box-shadow: 0 2px 8px color.change(variables.$accent, $alpha: 0.08);
    &:hover {
      background: variables.$accent-mid-light;
    }
  }

  .totals {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .total-card {
    padding: 8px 12px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid color.adjust(variables.$accent, $lightness: 15%);
    font-weight: 700;
  }

  .total-card.wins {
    color: variables.$primary;
  }
  .total-card.losses {
    color: #7a2b2b;
  }
  .total-card.stalemates {
    color: variables.$accent;
  }

  .controls label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: variables.$primary;
  }

  .controls .spacer {
    flex: 1 1 auto;
  }

  .empty {
    color: #666;
    font-style: italic;
  }



  .controls .input-small {
    width: 160px;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    justify-content: flex-start;
  }

  .controls .btn-primary {
    position: relative;
    padding-bottom: 8px;
  }

  .table-outer-scroll {
    overflow-x: auto;
    overflow-y: auto;
    max-width: 100%;
    max-height: 70vh;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(45, 48, 71, 0.08);
    background: #fff;
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    min-width: 900px;
    width: max-content;
    background: #fff;
    border-radius: 12px;
    table-layout: fixed;
    word-break: normal;
  }

  th,
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  thead th {
    background: variables.$primary-mid-light;
    color: #fff;
    padding: 8px 12px;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    position: sticky;
    top: 0;
    z-index: 2;
    user-select: none;
  }

  td {
    padding: 8px 12px;
    font-size: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  tbody tr:nth-child(even) {
    background: #fff;
  }

  tbody tr:nth-child(odd) {
    background: #efeeee;
  }

  tbody tr:hover {
    color: #fff;
    background: variables.$accent-light;
  }

  tbody tr:hover a {
    color: #fff;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr.mug-row-1-1 td {
    background-color: #e6e6b0;
  }

  tbody tr.mug-row-1-2 td {
    background-color: #82bb82;
  }

  tbody tr.mug-row-2-1 td {
    background-color: #e8e8a8;
  }

  tbody tr.mug-row-2-2 td {
    background-color: #78bc78;
  }

  tbody tr.mug-row-3-1 td {
    background-color: #ebeb85;
  }

  tbody tr.mug-row-3-2 td {
    background-color: #5ebd5e;
  }

  tbody tr.mug-row-3-1 td {
    background-color: #ebeb3a;
  }

  tbody tr.mug-row-3-2 td {
    background-color: #25ba25;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
    position: sticky;
    top: 0;
    transition: background-color 0.15s;
    &:hover,
    &.sorted {
      background: variables.$primary;
    }
    span.sort-key {
      margin-left: 6px;
      color: #fff;
      font-weight: bold;
      font-size: 1.1em;
      vertical-align: middle;
      padding: 0 2px;
      border-radius: 2px;
    }
  }

  .resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    z-index: 3;
    background: variables.$primary-light;
    user-select: none;
    &:hover {
      background: variables.$primary-mid-dark;
    }
  }

  button {
    background: variables.$accent;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 10px 24px;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 18px;
    cursor: pointer;
    transition: background-color 0.2s;
    box-shadow: 0 2px 8px color.change(variables.$accent, $alpha: 0.08);
    &:hover {
      background: variables.$accent-mid-light;
    }
  }

  a {
    text-decoration: none;
  }
}
</style>
