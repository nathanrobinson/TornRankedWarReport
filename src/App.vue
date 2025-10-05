<script setup lang="ts">

import { onMounted, onBeforeUnmount, watch, computed } from 'vue'
import RankedWarReport from './components/RankedWarReport.vue'
import UserAttackHistory from './components/UserAttackHistory.vue'
import { useTabs } from './components/useTabs'

const { activeTab, tabs, setTab } = useTabs([
  'Ranked War Report',
  'User Attack History',
])

// Helper: slugify tab labels into hash-friendly strings
const tabSlugs = computed(() =>
  tabs.map((t) =>
    String(t)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
  ),
)

function applyHashToTab(hash: string) {
  if (!hash) return
  const raw = hash.replace(/^#/, '')
  if (!raw) return
  // If hash is a number, use it as an index
  const asNum = Number(raw)
  if (!Number.isNaN(asNum) && Number.isInteger(asNum)) {
    if (asNum >= 0 && asNum < tabs.length) setTab(asNum)
    return
  }
  // Otherwise match slug
  const idx = tabSlugs.value.findIndex((s) => s === raw)
  if (idx !== -1) setTab(idx)
}

function onHashChange() {
  applyHashToTab(window.location.hash)
}

onMounted(() => {
  // Apply initial hash (if any)
  applyHashToTab(window.location.hash)
  window.addEventListener('hashchange', onHashChange)
  // Also listen for popstate so back/forward navigates pushed tab history
  window.addEventListener('popstate', onHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
  window.removeEventListener('popstate', onHashChange)
})

// Keep URL hash in sync when activeTab changes
watch(
  () => activeTab.value,
  (idx) => {
    const slug = tabSlugs.value[idx] ?? ''
    if (slug) {
      const newHash = `#${slug}`
      if (window.location.hash !== newHash) window.history.pushState(null, '', newHash)
    }
  },
)
</script>

<template>
  <div class="tab-group">
    <div class="tab-headers">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab"
        :class="['tab-btn', { active: activeTab === idx }]"
        @click="setTab(idx)"
      >
        {{ tab }}
      </button>
    </div>
    <div class="tab-content">
      <div v-if="activeTab === 0">
        <RankedWarReport />
      </div>
      <div v-else-if="activeTab === 1">
        <UserAttackHistory />
      </div>
    </div>
  </div>
  <footer class="footer">
    <span class="primary">Torn Ranked War Report</span> provided by
    <a href="https://www.torn.com/profiles.php?XID=3733696">TheDawgLives</a>
  </footer>
</template>

<style lang="scss">
@use '@/styles/variables';
@use 'sass:color';

$active-tab-bg: variables.$panel-bg;
$inactive-tab-bg: color.adjust(variables.$app-bg, $lightness: 10%);

body,
#app {
  background-color: variables.$app-bg;
  min-height: 100vh;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  padding: 0;
  margin: 0;
}

.tab-group {
  margin: 0 auto 2em auto;
  max-width: 1200px;
}
.tab-headers {
  display: flex;
  gap: 0.5em;
}
.tab-btn {
  margin: 1em 0 0 1em;
  font-size: 24pt;
  border-radius: 5px 5px 0 0;
  background-color: variables.$panel-bg;

  padding: 0.5em 1.5em;
  border: none;
  background: $inactive-tab-bg;
  color: variables.$accent;
  font-weight: 600;
  border-top: 3px solid variables.$primary;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.tab-btn.active {
  border-top: 2px solid variables.$accent;
  color: variables.$primary;
  background-color: $active-tab-bg;
}
.tab-anchor {
  margin-left: 8px;
  font-size: 12pt;
  opacity: 0.7;
  text-decoration: none;
  color: inherit;
}
.tab-content {
  background: variables.$panel-bg;
  border-radius: 0.5em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5em 1em 1em 1em;
}

.main-flex {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin: 0 auto;
  padding: 0 0.3em;
}

.side-by-side {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.table-panel {
  width: 100%;
  min-width: 0;
  flex: 1 1 0;
}

footer {
  font-weight: 100;
  font-size: 85%;
  text-align: center;

  .primary {
    color: variables.$primary;
  }

  a {
    color: variables.$accent;
    text-decoration: none;
  }
}

/* Responsive: side by side on large screens */
@media (min-width: 900px) {
  .side-by-side {
    flex-direction: row;
    align-items: flex-start;
  }
  .side-by-side > * {
    flex: 1 1 0;
    min-width: 0;
    max-width: 50%;
  }
}
</style>
