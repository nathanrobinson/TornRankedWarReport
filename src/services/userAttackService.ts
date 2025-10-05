import { TornApi } from './tornApiService'

export async function getUserAttacks(apiKey: string, count: number) {
  const tornApi = new TornApi(apiKey)
  const userAttacks = await tornApi.getUserAttacks(count)
  const weighted = userAttacks
    .filter((x) => x.respect_gain > 0)
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
      count: number
      record: (typeof weighted)[number]
    }
  >()

  for (const rec of weighted) {
    const defId = rec.defender?.id
    if (defId == null) continue
    const existing = groups.get(defId)
    if (!existing) {
      groups.set(defId, { count: 1, record: rec })
    } else {
      existing.count += 1
      if (rec.weightedRespect > existing.record.weightedRespect) {
        existing.record = rec
      }
    }
  }

  const grouped = Array.from(groups.values()).map((g) => ({
    ...g.record,
    count: g.count,
  }))

  // Sort groups by weightedRespect desc
  grouped.sort((a, b) => b.weightedRespect - a.weightedRespect)

  return grouped
}

export interface WeightedUserAttack {
  id: number
  weightedRespect: number
  fairFight: number
  count: number
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
