export interface RewardSettings {
  apiKey: string
  attackRewards: number
  assistRewards: number
  medOutRewards: number
  reviveRewards: number
  chainBuilderRewards: number
  payoutType: 'perAttack' | 'perRespect'
  ignoreChainBonus: boolean
  minMedOuts: number
}
