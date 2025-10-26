<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ (e: 'search', payload: { apiKey: string; numAttacks: number, showMugReport: boolean }): void }>()

const apiKey = ref('')
const numAttacks = ref(100)
const showMugReport = ref(false)

function handleSubmit() {
  if (apiKey.value && !props.loading) {
    emit('search', { apiKey: apiKey.value, numAttacks: numAttacks.value, showMugReport: showMugReport.value })
  }
}

const helpOpen = ref<string | null>(null)

const helpTexts: Record<string, string> = {
  apiKey:
    'Your Torn API key with at least limited access. This is required to fetch attack data. The key is not saved or transmitted anywhere except to the torn api.',
  showMugReport:
    'Shows money mugged. You Torn API key must be Full Access.'
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
  <form @submit.prevent="handleSubmit" class="attack-history-panel">
    <label for="uh-apiKey">Torn Limited API Key:
    <span
          class="help-icon"
          @mouseenter="showHelp('apiKey')"
          @mouseleave="hideHelp('apiKey')"
          @click="helpOpen === 'apiKey' ? hideHelp('apiKey') : showHelp('apiKey')"
          tabindex="0"
          >?</span
        >
        <span v-if="helpOpen === 'apiKey'" class="help-popup">{{ helpTexts.apiKey }}</span>
        <a
          class="small"
          href="https://www.torn.com/preferences.php#tab=api?&step=addNewKey&title=TornUserAttackHistory&type=3"
          target="_new"
          >Create API Key</a
        >
      </label>
    <input id="uh-apiKey" v-model="apiKey" type="password" placeholder="Enter API key" />

    <label for="uh-numAttacks">Number of attacks:</label>
    <input id="uh-numAttacks" v-model.number="numAttacks" type="number" min="1" />

      <label>
        <input type="checkbox" v-model="showMugReport" />
        <span class="label"
          >Show mug report
          <span
            class="help-icon"
            @mouseenter="showHelp('showMugReport')"
            @mouseleave="hideHelp('showMugReport')"
            @click="
              helpOpen === 'showMugReport'
                ? hideHelp('showMugReport')
                : showHelp('showMugReport')
            "
            tabindex="0"
            >?</span
          ></span
        >
        <span v-if="helpOpen === 'showMugReport'" class="help-popup">{{
          helpTexts.showMugReport
        }}</span>
      </label>

    <button type="submit" :disabled="props.loading">
      <span v-if="props.loading" class="spinner" aria-label="Loading"></span>
      <span v-else>Search</span>
    </button>
  </form>
</template>

<style scoped lang="scss">
@use '@/styles/variables';
@use '@/styles/input';

form {
  background: variables.$form-bg;
  border: 2px solid variables.$form-border;
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

.attack-history-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 640px;
  padding: 12px;
}

label {
  font-weight: 600;
  color: variables.$primary;
}
label > a.small {
  color: variables.$accent;
  font-size: 75%;
  font-weight: 100;
  margin-left: 8px;
  text-decoration: none;
  display: inline-block;
}

.actions {
  margin-top: 6px;
}

.actions .btn-primary {
  padding: 8px 12px;
}

.empty {
  margin-top: 8px;
  color: #666;
}

.help-icon {
  display: inline-block;
  margin-left: 6px;
  color: #fff;
  background: variables.$accent;
  border: 1px solid variables.$primary;
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
  background: variables.$form-input-bg;
  color: variables.$accent;
  font-weight: 100;
  font-style: italic;
  border: 1.5px solid variables.$accent;
  border-radius: 8px;
  padding: 5px 7px;
  min-width: 220px;
  max-width: 320px;
  font-size: 0.98em;
  box-shadow: 0 2px 12px variables.$form-box-shadow-color;
  white-space: normal;
  pointer-events: none;
}

.spinner {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border: 2.5px solid #fff;
  border-top: 2.5px solid variables.$primary;
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
</style>
