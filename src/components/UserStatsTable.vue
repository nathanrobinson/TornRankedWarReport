<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { UserStats } from '@/models/userStats'
// Add import for vue-draggable-next
import draggable from 'vuedraggable'

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

// --- Column state and drag/resize logic ---
const initialColumns = [
  { key: 'name', label: 'Player', width: 210 },
  { key: 'totalRewards', label: 'Total $', width: 120 },
  { key: 'attacks', label: 'Attacks', width: 50 },
  { key: 'respect', label: 'Respect Earned', width: 50 },
  { key: 'bonusRespect', label: 'Bonus Respect', width: 50 },
  { key: 'rewardAttackRespect', label: 'Attack/Respect $', width: 120 },
  { key: 'assists', label: 'Assists', width: 50 },
  { key: 'rewardAssists', label: 'Assist $', width: 110 },
  { key: 'medOuts', label: 'Med Outs', width: 50 },
  { key: 'rewardMedOuts', label: 'Med Out $', width: 110 },
  { key: 'revives', label: 'Revives', width: 50 },
  { key: 'rewardRevives', label: 'Revive $', width: 110 },
  { key: 'chainBuilds', label: 'Chain Builds', width: 50 },
  { key: 'rewardChainBuilds', label: 'Chain Build $', width: 110 },
]
const columns = ref([...initialColumns])

// Resizing logic
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
  // @ts-ignore: Object is possibly 'undefined' because we've handled the null case previously.
  columns.value[resizing.colIdx].width = newWidth
}
function onResizeMouseUp() {
  resizing.colIdx = null
  document.removeEventListener('mousemove', onResizeMouseMove)
  document.removeEventListener('mouseup', onResizeMouseUp)
}

// --- Sorting logic ---
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
  const headers = columns.value.map((col) => col.label)
  const rows = sortedUsers.value.map((u) =>
    columns.value.map((col) => {
      const val =
        col.key === 'name'
          ? `${u.name} [${u.id}]`
          : col.key.startsWith('reward') || col.key === 'totalRewards'
            ? formatCurrency(u[col.key as keyof UserStats] as number)
            : u[col.key as keyof UserStats]
      return val
    }),
  )
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
  <div class="table-scroll-wrapper">
    <button @click="exportToCSV">Export to Spreadsheet</button>
    <div class="table-outer-scroll">
      <table>
        <thead>
          <!-- Use draggable for columns -->
          <draggable
            v-model="columns"
            tag="tr"
            :component-data="{ tag: 'tr' }"
            :animation="150"
            :ghost-class="'dragging-col'"
            :chosen-class="'drag-over'"
            :handle="'.draggable-handle'"
            item-key="key"
            :force-fallback="true"
            :swap-threshold="0.65"
            :direction="'horizontal'"
          >
            <template #item="{ element: col, index: idx }">
              <th
                :key="col.key"
                @click="sortBy(col.key)"
                :class="['sortable', { sorted: sortKey === col.key }]"
                :style="{ width: col.width + 'px', position: 'relative' }"
              >
                <span class="draggable-handle" style="cursor: grab">
                  {{ col.label }}
                </span>
                <span v-if="sortKey === col.key" class="sort-key">
                  <span v-if="sortDir === 'asc'">&#9650;</span>
                  <span v-else>&#9660;</span>
                </span>
                <span
                  class="resize-handle"
                  @mousedown.stop="onResizeMouseDown($event, idx)"
                  title="Drag to resize"
                ></span>
              </th>
            </template>
          </draggable>
        </thead>
        <tbody>
          <tr v-for="user in sortedUsers" :key="user.id">
            <td v-for="col in columns" :key="col.key">
              <template v-if="col.key === 'name'"> {{ user.name }} [{{ user.id }}] </template>
              <template v-else-if="col.key.startsWith('reward') || col.key === 'totalRewards'">
                {{ formatCurrency(user[col.key as keyof UserStats] as number) }}
              </template>
              <template v-else>
                {{ user[col.key as keyof UserStats] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/variables';

$table-header-bg: variables.$primary-mid-light;
$table-header-text: #fff;
$table-row-even: #fff;
$table-row-odd: #efeeee;
$table-border: variables.$accent;
$table-row-hover-fg: #fff;
$table-row-hover: variables.$accent-light;
$table-cell-padding: 8px 12px;
$sort-indicator-shadow-color: variables.$accent-mid-dark;
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
  overflow: wrap;
  top: 0;
  z-index: 2;
  user-select: none;
  .th-content {
    pointer-events: none;
  }
  &.dragging-col {
    opacity: 0.4;
  }
  &.drag-over {
    outline: 2px dashed variables.$primary;
    outline-offset: -2px;
    background: variables.$primary-light;
  }
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
    background: variables.$primary;
  }
  span.sort-key {
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
</style>
