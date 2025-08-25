import { mount } from '@vue/test-utils'
import UserSettingsForm from '../UserSettingsForm.vue'
import { describe, expect, it } from 'vitest'
import type { RewardSettings } from '@/models/rewardSettings'

describe('UserSettingsForm', () => {
  async function fillForm(
    wrapper: ReturnType<typeof mount>,
    values: Record<string, string | number | boolean>,
  ) {
    if ('apiKey' in values) wrapper.find('input#apiKey').setValue(String(values.apiKey))
    if ('attackRewards' in values)
      wrapper.find('input#attackRewards').setValue(values.attackRewards)
    if ('assistRewards' in values)
      wrapper.find('input#assistRewards').setValue(values.assistRewards)
    if ('medOutRewards' in values)
      wrapper.find('input#medOutRewards').setValue(values.medOutRewards)
    if ('reviveRewards' in values)
      wrapper.find('input#reviveRewards').setValue(values.reviveRewards)
    if ('chainBuilderRewards' in values)
      wrapper.find('input#chainBuilderRewards').setValue(values.chainBuilderRewards)
    if ('minMedOuts' in values) wrapper.find('input#minMedOuts').setValue(values.minMedOuts)
    if ('payoutType' in values) wrapper.find('select').setValue(String(values.payoutType))
    if ('ignoreChainBonus' in values) {
      const cb = wrapper.find('input[type="checkbox"]')
      if (
        cb.element instanceof HTMLInputElement &&
        cb.element.checked !== Boolean(values.ignoreChainBonus)
      ) {
        // setChecked is private, so trigger click if needed
        await cb.trigger('click')
      }
    }
  }

  it('renders all fields and help icons', () => {
    const wrapper = mount(UserSettingsForm)
    expect(wrapper.find('input#apiKey').exists()).toBe(true)
    expect(wrapper.find('input#attackRewards').exists()).toBe(true)
    expect(wrapper.find('input#assistRewards').exists()).toBe(true)
    expect(wrapper.find('input#medOutRewards').exists()).toBe(true)
    expect(wrapper.find('input#reviveRewards').exists()).toBe(true)
    expect(wrapper.find('input#chainBuilderRewards').exists()).toBe(true)
    expect(wrapper.find('input#minMedOuts').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.findAll('.help-icon').length).toBeGreaterThan(0)
  })

  it('shows and hides help popups on mouse events', async () => {
    const wrapper = mount(UserSettingsForm)
    const help = wrapper.find('.help-icon')
    await help.trigger('mouseenter')
    expect(wrapper.find('.help-popup').exists()).toBe(true)
    await help.trigger('mouseleave')
    expect(wrapper.find('.help-popup').exists()).toBe(false)
    await help.trigger('click')
    expect(wrapper.find('.help-popup').exists()).toBe(true)
    await help.trigger('click')
    expect(wrapper.find('.help-popup').exists()).toBe(false)
  })

  it('disables ignoreChainBonus when payoutType is perAttack', async () => {
    const wrapper = mount(UserSettingsForm)
    await wrapper.find('select').setValue('perAttack')
    expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeDefined()
  })

  it('enables ignoreChainBonus when payoutType is perRespect', async () => {
    const wrapper = mount(UserSettingsForm)
    await wrapper.find('select').setValue('perRespect')
    expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeUndefined()
  })

  it('handles empty and invalid numeric input as 0', async () => {
    const wrapper = mount(UserSettingsForm)
    await fillForm(wrapper, {
      apiKey: 'k',
      attackRewards: '',
      assistRewards: 'abc',
      medOutRewards: '!!!',
      reviveRewards: '',
      chainBuilderRewards: '',
      minMedOuts: '',
    })
    await wrapper.find('form').trigger('submit.prevent')
    const emitted = wrapper.emitted<RewardSettings[]>('submit')?.[0]?.[0]
    expect(emitted?.attackRewards).toBe(0)
    expect(emitted?.assistRewards).toBe(0)
    expect(emitted?.medOutRewards).toBe(0)
    expect(emitted?.reviveRewards).toBe(0)
    expect(emitted?.chainBuilderRewards).toBe(0)
    expect(emitted?.minMedOuts).toBe(0)
  })

  it('requires apiKey input', async () => {
    const wrapper = mount(UserSettingsForm)
    await fillForm(wrapper, { apiKey: '' })
    await wrapper.find('form').trigger('submit.prevent')
    // HTML5 required attribute prevents submission, so no submit event
    const emitted = wrapper.emitted<RewardSettings[]>('submit')?.[0]?.[0]
    expect(emitted).toBeUndefined()
  })

  it('handles edge case: whitespace-only input', async () => {
    const wrapper = mount(UserSettingsForm)
    await fillForm(wrapper, {
      apiKey: 'k',
      attackRewards: '   ',
      assistRewards: ' ',
      medOutRewards: '\t',
      reviveRewards: '\n',
      chainBuilderRewards: ' ',
      minMedOuts: ' ',
    })
    await wrapper.find('form').trigger('submit.prevent')
    const emitted = wrapper.emitted<RewardSettings[]>('submit')?.[0]?.[0]
    expect(emitted?.attackRewards).toBe(0)
    expect(emitted?.assistRewards).toBe(0)
    expect(emitted?.medOutRewards).toBe(0)
    expect(emitted?.reviveRewards).toBe(0)
    expect(emitted?.chainBuilderRewards).toBe(0)
    expect(emitted?.minMedOuts).toBe(0)
  })
})
