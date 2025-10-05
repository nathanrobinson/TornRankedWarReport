import { TornApi } from './tornApiService'

const winTypes = ['Attacked', 'Hospitalized', 'Mugged']
const lostType = 'Lost'
const stalemateType = 'Stalemate'

export async function getUserAttacks(apiKey: string, count: number): Promise<WeightedUserAttack[]> {
  const tornApi = new TornApi(apiKey)
  const userAttacks = await tornApi.getUserAttacks(count)
  const weighted = userAttacks
    .map((x) => ({
      id: x.id,
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

  return grouped
    .filter((x) => x.wins > 0 && x.weightedRespect > 0)
    .sort((a, b) => b.weightedRespect - a.weightedRespect)
}

export interface WeightedUserAttack {
  id: number
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
