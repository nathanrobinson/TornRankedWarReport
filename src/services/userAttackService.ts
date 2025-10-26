import { TornApi } from './tornApiService'

const winTypes = ['Attacked', 'Hospitalized', 'Mugged']
const lostType = 'Lost'
const stalemateType = 'Stalemate'

export async function getUserAttacks(
  apiKey: string,
  count: number,
): Promise<{
  totals: { [result: string]: number }
  attacks: WeightedUserAttack[]
}> {
  const tornApi = new TornApi(apiKey)
  const userAttacks = await tornApi.getUserAttacks(count)
  const weighted = userAttacks
    .map((x) => ({
      id: x.code,
      fairFight: x.modifiers.fair_fight,
      weightedRespect:
        x.respect_gain /
        (x.modifiers.chain *
          x.modifiers.group *
          x.modifiers.overseas *
          x.modifiers.retaliation *
          x.modifiers.war *
          x.modifiers.warlord),
      defender: x.defender,
      result: x.result,
    }))
    .sort((a, b) => b.defender.id - a.defender.id)

  const totals = weighted.reduce((acc: { [result: string]: number }, x) => {
    acc[x.result] = (acc[x.result] ?? 0) + 1

    return acc
  }, {})

  const groups = new Map<
    number,
    {
      results: {
        wins: number
        losses: number
        stalemates: number
      }
      record: (typeof weighted)[number]
    }
  >()

  for (const rec of weighted) {
    const defId = rec.defender?.id
    if (defId == null) continue

    const win = winTypes.indexOf(rec.result) >= 0
    const loss = rec.result === lostType
    const stalemate = rec.result === stalemateType

    const existing = groups.get(defId)
    if (!existing) {
      groups.set(defId, {
        results: {
          wins: win ? 1 : 0,
          losses: loss ? 1 : 0,
          stalemates: stalemate ? 1 : 0,
        },
        record: rec,
      })
    } else {
      if (win) {
        existing.results.wins++
      } else if (loss) {
        existing.results.losses++
      } else if (stalemate) {
        existing.results.stalemates++
      }
      if (rec.weightedRespect > existing.record.weightedRespect) {
        existing.record = rec
      }
    }
  }

  const grouped = Array.from(groups.values()).map((g) => ({
    ...g.record,
    ...g.results,
  }))

  const attacks = grouped
    .filter((x) => x.wins > 0 && x.weightedRespect > 0)
    .sort((a, b) => b.weightedRespect - a.weightedRespect)

  return { totals, attacks }
}

export async function getMugs(
  apiKey: string,
  count: number,
): Promise<{
  totals: { mugs: number; totalMugged: number }
  attacks: UserMug[]
}> {
  const tornApi = new TornApi(apiKey)
  const userAttacks = await tornApi.getMugs(count)
  const totals = userAttacks.reduce(
    (previous, current) => ({
      mugs: previous.mugs + 1,
      totalMugged: previous.totalMugged + current.data.money_mugged,
    }),
    { mugs: 0, totalMugged: 0 },
  )

  const groups = new Map<number, UserMug>()

  userAttacks.map((x) => {
    const userAttack: UserMug = {
      defender: x.data.defender,
      timestamp: x.timestamp,
      amount: x.data.money_mugged,
      timesMugged: 1,
      link: x.data.log,
    }

    const existing = groups.get(userAttack.defender)

    if (existing) {
      if (existing.timestamp > userAttack.timestamp) {
        existing.timesMugged++
        return
      } else {
        userAttack.timesMugged += existing.timesMugged
      }
    }

    groups.set(userAttack.defender, userAttack)
  })

  const attacks = Array.from(groups.values())

  return { totals, attacks }
}

export interface WeightedUserAttack {
  id: string
  weightedRespect: number
  fairFight: number
  wins: number
  losses: number
  stalemates: number
  result: string
  defender: {
    id: number
    name: string
    level: number
    faction: {
      id: number
      name: string
    }
  }
}

export interface UserMug {
  defender: number
  timestamp: number
  amount: number
  timesMugged: number
  link: string
}
