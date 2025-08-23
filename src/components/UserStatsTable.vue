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
  { key: 'rewardAttackRespect', label: 'Attack/Respect $' },
  { key: 'rewardAssists', label: 'Assist $' },
  { key: 'rewardMedOuts', label: 'Med Out $' },
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
    formatCurrency(u.rewardAttackRespect),
    formatCurrency(u.rewardAssists),
    formatCurrency(u.rewardMedOuts),
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
</script>

<template>
  <div>
    <button @click="exportToCSV">Export to Spreadsheet</button>
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            @click="sortBy(col.key)"
            :class="{ sortable: true, sorted: sortKey === col.key }"
            style="cursor: pointer; user-select: none"
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
          <td>{{ formatCurrency(user.rewardAttackRespect) }}</td>
          <td>{{ formatCurrency(user.rewardAssists) }}</td>
          <td>{{ formatCurrency(user.rewardMedOuts) }}</td>
          <td>{{ formatCurrency(user.totalRewards) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

$primary: #b5112f;
$accent: #2d3047;
$table-header-bg: $primary;
$table-header-text: #fff;
$table-row-even: #ffffff;
$table-row-odd: #e7e7e7;
$table-border: $accent;
$table-row-hover: color.adjust($primary, $lightness: 90%);
$table-cell-padding: 8px 12px;

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
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(209, 16, 51, 0.08);
  &:hover {
    background: color.adjust($accent, $lightness: 10%);
  }
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(45, 48, 71, 0.08);
  table-layout: fixed;
  word-break: break-word;
}

th {
  background: $table-header-bg;
  color: $table-header-text;
  padding: $table-cell-padding;
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: 3px solid $table-border;
  letter-spacing: 0.03em;
  word-break: break-word;
}

td {
  padding: $table-cell-padding;
  font-size: 1rem;
  border-bottom: 1px solid #e0e0e0;
  word-break: break-word;
}

tbody tr {
  transition: background 0.2s;
}

tbody tr:nth-child(even) {
  background: $table-row-even;
}

tbody tr:nth-child(odd) {
  background: $table-row-odd;
}

tbody tr:hover {
  background: $table-row-hover;
}

tr:last-child td {
  border-bottom: none;
}

th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background 0.15s;
  &:hover,
  &.sorted {
    background: color.adjust($primary, $lightness: 10%);
  }
  span {
    margin-left: 6px;
    font-size: 0.95em;
    color: $accent;
    vertical-align: middle;
  }
}
</style>
