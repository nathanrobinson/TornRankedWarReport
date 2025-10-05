<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { WeightedUserAttack } from '@/services/userAttackService'

const props = defineProps<{ attacks: WeightedUserAttack[]; totals?: { [result: string]: number } | null; }>()

// Filters
const minWeighted = ref(0)

// Sorting
const sortedTotals = computed(() => Object.keys(props.totals ?? {}).sort())

const sortKey = ref<'wins' | 'losses' | 'stalemates' | 'weightedRespect' | 'defender' | 'level' | 'fairFight' | 'result'>('weightedRespect')
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
  { key: 'level', label: 'Level', width: 80 },
  { key: 'weightedRespect', label: 'Base Respect', width: 140 },
  { key: 'fairFight', label: 'Fair Fight', width: 100 },
  { key: 'wins', label: 'Wins', width: 80 },
  { key: 'losses', label: 'Losses', width: 80 },
  { key: 'stalemates', label: 'Stalemates', width: 100 },
  { key: 'result', label: 'Result', width: 120 },
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
  return (props.attacks || []).filter((a) => a.weightedRespect >= minWeighted.value)
})

const sorted = computed(() => {
  const arr = [...filtered.value]
  const key = sortKey.value
  const dir = sortDir.value
  arr.sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0
    switch (key) {
      case 'wins':
        aVal = a.wins
        bVal = b.wins
        break
      case 'losses':
        aVal = a.losses
        bVal = b.losses
        break
      case 'stalemates':
        aVal = a.stalemates
        bVal = b.stalemates
        break
      case 'weightedRespect':
        aVal = a.weightedRespect
        bVal = b.weightedRespect
        break
      case 'level':
        aVal = a.defender.level
        bVal = b.defender.level
        break
      case 'fairFight':
        aVal = a.fairFight
        bVal = b.fairFight
        break
      case 'defender':
      default:
        aVal = a.defender.name.toLowerCase()
        bVal = b.defender.name.toLowerCase()
    }

    if (typeof aVal === 'string') {
      return dir === 'asc' ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string)
    }
    return dir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })
  return arr
})

function exportCSV() {
  const headers = ['Defender', 'DefenderId', 'Level', 'BaseRespect', 'FairFight', 'Wins', 'Losses', 'Stalemates', 'Result']
  const rows = sorted.value.map((a) => [a.defender.name, String(a.defender.id), String(a.defender.level), a.weightedRespect.toFixed(2), String(a.fairFight), String(a.wins), String(a.losses), String(a.stalemates), a.result])
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
</script>

<template>

  <div v-if="!props.attacks || props.attacks.length === 0" class="empty">No attacks found.</div>

  <div v-else class="attack-results">
    <h2>User Attack Results</h2>

      <div v-if="props.totals" class="totals">
        <div v-for="result of sortedTotals" v-bind:key="result" class="total-card">{{ result }}: {{ props.totals[result] }}</div>
      </div>

      <div class="controls">
        <button class="btn-primary" @click="exportCSV">Export Spreadsheet</button>
        <div class="spacer"></div>
        <label class="input-small">
          Min respect
          <input type="number" v-model.number="minWeighted" step="0.1" min="0" />
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
            <tr v-for="attack in sorted" :key="attack.id">
              <td v-for="col in columns" :key="col.key">
                <template v-if="col.key === 'defender'">
                  <a :href="`https://www.torn.com/profiles.php?XID=${attack.defender.id}`" target="_player">{{ attack.defender.name }}</a>
                  [<a :href="`https://www.torn.com/profiles.php?XID=${attack.defender.id}`" target="_player">{{ attack.defender.id }}</a>]
                  <a :href="`https://www.torn.com/loader.php?sid=attack&user2ID=${attack.defender.id}`" target="_attack">⚔️</a>
                </template>
                <template v-else-if="col.key === 'level'">{{ attack.defender.level }}</template>
                <template v-else-if="col.key === 'weightedRespect'">{{ attack.weightedRespect.toFixed(2) }}</template>
                <template v-else-if="col.key === 'fairFight'">{{ attack.fairFight }}</template>
                <template v-else-if="col.key === 'wins'">{{ attack.wins }}</template>
                <template v-else-if="col.key === 'losses'">{{ attack.losses }}</template>
                <template v-else-if="col.key === 'stalemates'">{{ attack.stalemates }}</template>
                <template v-else-if="col.key === 'result'">{{ attack.result }}</template>
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
