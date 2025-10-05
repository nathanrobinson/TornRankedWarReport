// Simple tab group composable for App.vue
import { ref } from 'vue'

export function useTabs(tabLabels: string[]) {
  const activeTab = ref(0)
  const tabs = tabLabels
  function setTab(idx: number) {
    activeTab.value = idx
  }
  return { activeTab, tabs, setTab }
}
