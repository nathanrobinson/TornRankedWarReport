export interface WarStats {
  factionName: string
  opponentName: string
  rankedWarId: number
  totalAttacks: number
  rewardPerAttack: number | null
  totalRespect: number
  rewardPerRespect: number | null
  totalAssists: number
  rewardPerAssist: number
  totalMedOuts: number
  rewardPerMedOut: number
  totalRevives: number
  rewardPerRevive: number
  totalChainBuilds: number
  rewardPerChainBuild: number
}
