export interface RewardSettings {
  apiKey: string
  attackRewards: number
  assistRewards: number
  medOutRewards: number
  payoutType: 'perAttack' | 'perRespect'
  ignoreChainBonus: boolean
}
