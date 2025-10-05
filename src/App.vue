<script setup lang="ts">

import RankedWarReport from './components/RankedWarReport.vue'
import UserAttackHistory from './components/UserAttackHistory.vue'
import { useTabs } from './components/useTabs'

const { activeTab, tabs, setTab } = useTabs([
  'Ranked War Report',
  'User Attack History',
])
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
