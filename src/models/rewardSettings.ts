export interface RewardSettings {
  apiKey: string
  attackRewards: number
  assistRewards: number
  medOutRewards: number
  reviveRewards: number
  payoutType: 'perAttack' | 'perRespect'
  ignoreChainBonus: boolean
  minMedOuts: number
}
