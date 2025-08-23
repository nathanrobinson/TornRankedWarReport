import type { RewardSettings } from '@/models/rewardSettings'
import type { UserStats } from '@/models/userStats'
import type { WarStats } from '@/models/warStats'
import { TornApi } from './tornApiService'

async function getWarReport(apiKey: string) {
  const tornApi = new TornApi(apiKey)
  const factionWarReport = await tornApi.getWarReport()

  if (!factionWarReport?.factionId || !factionWarReport?.rankedWar?.rankedwarreport) {
    return
  }

  const lastWarReport = factionWarReport.rankedWar.rankedwarreport.factions.find(
    (x) => x.id === factionWarReport.factionId,
  )

  if (!lastWarReport) {
    return
  }

  const opponent = factionWarReport.rankedWar.rankedwarreport.factions.find(
    (x) => x.id !== factionWarReport.factionId,
  )

  const currentUnixTimeInSeconds = Math.floor(Date.now() / 1000)
  const start = factionWarReport.rankedWar.rankedwarreport.start
  const end = factionWarReport.rankedWar.rankedwarreport.end ?? currentUnixTimeInSeconds

  const playerChainReports = await tornApi.getChainReports(start, end)

  const factionId = lastWarReport.id
  const opponentId = opponent?.id

  let playerDefends: { [playerId: number]: number } = {}
  let playerRevives: { [playerId: number]: number } = {}

  if (factionId && opponentId) {
    playerDefends = await tornApi.getLosses(factionId, opponentId, start, end)
    playerRevives = await tornApi.getRevives(factionId, start, end)
  }

  const totalAttacks = lastWarReport.attacks
  const totalRespect = lastWarReport.score
  let bonusRespect = 0
  let totalAssists = 0
  for (const pid in playerChainReports) {
    bonusRespect += playerChainReports[pid]?.bonus ?? 0
    totalAssists += playerChainReports[pid]?.assists ?? 0
  }

  let totalDefends = 0
  for (const pid in playerDefends) {
    totalDefends += playerDefends[pid] ?? 0
  }

  let totalRevives = 0
  for (const pid in playerRevives) {
    totalRevives += playerRevives[pid] ?? 0
  }

  return {
    id: factionWarReport.rankedWar.rankedwarreport.id,
    opponent: opponent?.name,
    totalAttacks,
    totalRespect,
    totalAssists,
    totalDefends,
    totalRevives,
    bonusRespect,
    playerChainReports,
    lastWarReport,
    playerDefends,
    playerRevives,
  }
}

export async function calculateRewards(settings: RewardSettings): Promise<
  | {
      warStats: WarStats
      userStats: UserStats[]
    }
  | undefined
> {
  const warReport = await getWarReport(settings.apiKey)

  if (!warReport) {
    return undefined
  }

  const calculatedRespect = Math.max(warReport.totalRespect - warReport.bonusRespect, 0)

  const warStats: WarStats = {
    rankedWarId: warReport.id,
    factionName: warReport.lastWarReport.name,
    opponentName: warReport.opponent ?? '',
    totalAttacks: warReport.totalAttacks,
    totalRespect: warReport.totalRespect,
    totalAssists: warReport.totalAssists,
    totalMedOuts: warReport.totalDefends,
    totalRevives: warReport.totalRevives,
    rewardPerRespect: settings.attackRewards / (calculatedRespect || 1),
    rewardPerAttack: settings.attackRewards / (warReport.totalAttacks || 1),
    rewardPerAssist: settings.assistRewards / (warReport.totalAssists || 1),
    rewardPerMedOut: settings.medOutRewards / (warReport.totalDefends || 1),
    rewardPerRevive: settings.reviveRewards / (warReport.totalRevives || 1),
  }

  const userStats = warReport.lastWarReport.members
    .map((user) => {
      let playerRespect = user.score
      const playerBonus = warReport.playerChainReports[user.id]?.bonus
      const playerAssists = warReport.playerChainReports[user.id]?.assists
      const playerMedOuts = warReport.playerDefends[user.id] ?? 0
      const playerRevives = warReport.playerRevives[user.id] ?? 0

      if (settings.payoutType === 'perRespect' && settings.ignoreChainBonus && playerBonus > 10) {
        playerRespect -= Math.min(playerBonus - 10, 0)
      }
      const rewardAttackRespect =
        settings.payoutType === 'perAttack'
          ? user.attacks * (warStats.rewardPerAttack ?? 0)
          : playerRespect * (warStats.rewardPerRespect ?? 0)

      const rewardAssists = playerAssists * warStats.rewardPerAssist
      const rewardMedOuts = playerMedOuts * warStats.rewardPerMedOut
      const rewardRevives = playerRevives * warStats.rewardPerRevive
      const totalRewards = rewardAttackRespect + rewardAssists + rewardMedOuts + rewardRevives

      // Helper to blank 0/NaN
      const blank = (val: number | undefined | null) => (!val || isNaN(val) ? 0 : val)

      return {
        id: user.id,
        name: user.name,
        attacks: blank(user.attacks),
        respect: blank(user.score),
        bonusRespect: blank(playerBonus),
        assists: blank(playerAssists),
        medOuts: blank(playerMedOuts),
        revives: blank(playerRevives),
        rewardAttackRespect: blank(rewardAttackRespect),
        rewardAssists: blank(rewardAssists),
        rewardMedOuts: blank(rewardMedOuts),
        rewardRevives: blank(rewardRevives),
        totalRewards: blank(totalRewards),
      }
    })
    // Filter out users with no rewards (0 or NaN for all reward fields)
    .filter((u) =>
      [
        u.rewardAttackRespect,
        u.rewardAssists,
        u.rewardMedOuts,
        u.rewardRevives,
        u.totalRewards,
      ].some((val) => val),
    )

  return {
    warStats,
    userStats,
  }
}
