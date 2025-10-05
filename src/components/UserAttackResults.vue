<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WeightedUserAttack } from '@/services/userAttackService'

const props = defineProps<{ attacks: WeightedUserAttack[]; }>()

// Filters
const minWeighted = ref(0)

// Sorting
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
  const headers = ['Defender', 'DefenderId', 'Level', 'WeightedRespect', 'FairFight', 'Wins', 'Losses', 'Stalemates', 'Result']
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

      <div class="controls">
        <label>
          Min weighted
          <input type="number" v-model.number="minWeighted" step="0.01" min="0" />
        </label>
        <div class="spacer"></div>
        <button class="btn-primary" @click="exportCSV">Export CSV</button>
      </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th @click.prevent="setSort('defender')">Defender <span class="sort-ind">{{ sortKey === 'defender' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('level')">Level <span class="sort-ind">{{ sortKey === 'level' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('weightedRespect')">Weighted Respect <span class="sort-ind">{{ sortKey === 'weightedRespect' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('fairFight')">Fair Fight <span class="sort-ind">{{ sortKey === 'fairFight' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('wins')">Wins <span class="sort-ind">{{ sortKey === 'wins' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('losses')">Losses <span class="sort-ind">{{ sortKey === 'losses' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('stalemates')">Stalemates <span class="sort-ind">{{ sortKey === 'stalemates' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
            <th @click.prevent="setSort('result')">Result <span class="sort-ind">{{ sortKey === 'result' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attack in sorted" :key="attack.id">
            <td>
              <a :href="`https://www.torn.com/profiles.php?XID=${attack.defender.id}`" target="_player">{{ attack.defender.name }}</a>
              [<a :href="`https://www.torn.com/profiles.php?XID=${attack.defender.id}`" target="_player">{{ attack.defender.id }}</a>]
              <a :href="`https://www.torn.com/loader.php?sid=attack&user2ID=${attack.defender.id}`" target="_attack">⚔️</a></td>
            <td>{{ attack.defender.level }}</td>
            <td>{{ attack.weightedRespect.toFixed(2) }}</td>
            <td>{{ attack.fairFight }}</td>
            <td>{{ attack.wins }}</td>
            <td>{{ attack.losses }}</td>
            <td>{{ attack.stalemates }}</td>
            <td>{{ attack.result }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/styles/variables';

.attack-results {
  h2 {
    color: variables.$primary;
    margin-bottom: 8px;
  }

  .controls {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
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

  .table-wrap {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    border: 2px solid variables.$accent;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
  }

  thead th {
    background: variables.$primary-mid-light;
    color: #fff;
    font-weight: 700;
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
  }

  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #e6e6e6;
  }

  tbody tr:nth-child(even) {
    background: #fff;
  }

  tbody tr:nth-child(odd) {
    background: #f6f5f5;
  }

  tbody tr:hover, tbody tr:hover a {
    background: variables.$accent-light;
    color: #fff;
  }

  a {
    text-decoration: none;
  }
}
</style>
