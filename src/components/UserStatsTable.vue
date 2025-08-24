<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserStats } from '@/models/userStats'

const props = defineProps<{
  users: UserStats[]
}>()

function formatCurrency(val: number): string {
  return val.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// Sorting logic
const columns = [
  { key: 'name', label: 'Player' },
  { key: 'attacks', label: 'Attacks' },
  { key: 'respect', label: 'Respect Earned' },
  { key: 'bonusRespect', label: 'Bonus Respect' },
  { key: 'assists', label: 'Assists' },
  { key: 'medOuts', label: 'Med Outs' },
  { key: 'revives', label: 'Revives' },
  { key: 'chainBuilds', label: 'Chain Builds' },
  { key: 'rewardAttackRespect', label: 'Attack/Respect $' },
  { key: 'rewardAssists', label: 'Assist $' },
  { key: 'rewardMedOuts', label: 'Med Out $' },
  { key: 'rewardRevives', label: 'Revive $' },
  { key: 'rewardChainBuilds', label: 'Chain Build $' },
  { key: 'totalRewards', label: 'Total $' },
]

const sortKey = ref('totalRewards')
const sortDir = ref<'asc' | 'desc'>('desc')

function sortBy(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const sortedUsers = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value
  return [...props.users].sort((a, b) => {
    let aVal = a[key as keyof UserStats]
    let bVal = b[key as keyof UserStats]
    // For name, sort as string; for others, as numbers
    if (key === 'name') {
      aVal = String(aVal)
      bVal = String(bVal)
      return dir === 'asc'
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string)
    } else {
      const aNum = typeof aVal === 'number' ? aVal : Number(aVal)
      const bNum = typeof bVal === 'number' ? bVal : Number(bVal)
      return dir === 'asc' ? aNum - bNum : bNum - aNum
    }
  })
})

function exportToCSV() {
  const headers = columns.map((col) => col.label)
  const rows = sortedUsers.value.map((u) => [
    `${u.name} [${u.id}]`,
    u.attacks,
    u.respect,
    u.bonusRespect,
    u.assists,
    u.medOuts,
    u.revives,
    u.chainBuilds,
    formatCurrency(u.rewardAttackRespect),
    formatCurrency(u.rewardAssists),
    formatCurrency(u.rewardMedOuts),
    formatCurrency(u.rewardRevives),
    formatCurrency(u.rewardChainBuilds),
    formatCurrency(u.totalRewards),
  ])
  const csvContent = [headers, ...rows]
    .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'user_stats.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const columnWidths: Record<string, string> = {
  name: '210px',
  attacks: '50px',
  respect: '50px',
  bonusRespect: '50px',
  assists: '50px',
  medOuts: '50px',
  revives: '50px',
  chainBuilds: '50px',
  rewardAttackRespect: '120px',
  rewardAssists: '110px',
  rewardMedOuts: '110px',
  rewardRevives: '110px',
  rewardChainBuilds: '110px',
  totalRewards: '120px',
}
</script>

<template>
  <div class="table-scroll-wrapper">
    <button @click="exportToCSV">Export to Spreadsheet</button>
    <div class="table-outer-scroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              @click="sortBy(col.key)"
              :class="{ sortable: true, sorted: sortKey === col.key }"
              :style="{ width: columnWidths[col.key] }"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key">
                <span v-if="sortDir === 'asc'">&#9650;</span>
                <span v-else>&#9660;</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sortedUsers" :key="user.id">
            <td>{{ user.name }} [{{ user.id }}]</td>
            <td>{{ user.attacks }}</td>
            <td>{{ user.respect }}</td>
            <td>{{ user.bonusRespect }}</td>
            <td>{{ user.assists }}</td>
            <td>{{ user.medOuts }}</td>
            <td>{{ user.revives }}</td>
            <td>{{ user.chainBuilds }}</td>
            <td>{{ formatCurrency(user.rewardAttackRespect) }}</td>
            <td>{{ formatCurrency(user.rewardAssists) }}</td>
            <td>{{ formatCurrency(user.rewardMedOuts) }}</td>
            <td>{{ formatCurrency(user.rewardRevives) }}</td>
            <td>{{ formatCurrency(user.rewardChainBuilds) }}</td>
            <td>{{ formatCurrency(user.totalRewards) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

$primary: #b5112f;
$accent: #2d3047;
$table-header-bg: color.adjust($primary, $lightness: 10%);
$table-header-text: #fff;
$table-row-even: #fff;
$table-row-odd: #efeeee;
$table-border: $accent;
$table-row-hover-fg: #fff;
$table-row-hover: color.adjust($accent, $lightness: 25%);
$table-cell-padding: 8px 12px;
$sort-indicator-shadow-color: color.adjust($accent, $lightness: -10%);
$sort-indicator-shadow:
  -1px -1px 0 $sort-indicator-shadow-color,
  1px -1px 0 $sort-indicator-shadow-color,
  -1px 1px 0 $sort-indicator-shadow-color,
  1px 1px 0 $sort-indicator-shadow-color;

.table-scroll-wrapper {
  width: 100%;
  overflow: hidden;
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
  min-width: 1200px;
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

th {
  background: $table-header-bg;
  color: $table-header-text;
  padding: $table-cell-padding;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  position: sticky;
  top: 0;
  z-index: 2;
}

td {
  padding: $table-cell-padding;
  font-size: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

tbody tr {
  transition:
    background-color 0.2s ease-in,
    color 0.2s ease-in;
}

tbody tr:nth-child(even) {
  background: $table-row-even;
}

tbody tr:nth-child(odd) {
  background: $table-row-odd;
}

tbody tr:hover {
  color: $table-row-hover-fg;
  background: $table-row-hover;
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
    background: $primary;
  }
  span {
    margin-left: 6px;
    color: #fff;
    text-shadow: $sort-indicator-shadow;
    font-weight: bold;
    font-size: 1.1em;
    vertical-align: middle;
    padding: 0 2px;
    border-radius: 2px;
  }
}

button {
  background: $accent;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(209, 16, 51, 0.08);
  &:hover {
    background: color.adjust($accent, $lightness: 10%);
  }
}
</style>
