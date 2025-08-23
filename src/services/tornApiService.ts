export class TornApi {
  #key: string
  #baseUrl = 'https://api.torn.com/v2/'

  constructor(key: string) {
    this.#key = key
  }

  async #fetch<T>(path: string, query?: { [key: string]: string | number }): Promise<T> {
    let uri = `${this.#baseUrl}${path}`
    if (query) {
      let first = true
      for (const key in query) {
        uri += `${first ? '?' : '&'}${key}=${query[key]}`
        first = false
      }
    }

    const response = await fetch(uri, {
      headers: {
        accept: 'application/json',
        Authorization: `ApiKey ${this.#key}`,
      },
    })

    return await response.json()
  }

  async #getFactionId(): Promise<number | undefined> {
    const factionInfo = await this.#fetch<FactionInfo>('faction/basic')

    return factionInfo?.basic?.id
  }

  async #getLastWar(factionId: number): Promise<number | undefined> {
    if (!factionId) {
      return undefined
    }

    const wars = await this.#fetch<Wars>(`faction/${factionId}/rankedwars`)

    return wars?.rankedwars?.find((x) => x.end)?.id
  }

  async #getChainIds(start: number, end: number): Promise<number[] | undefined> {
    const chains = await this.#fetch<Chains>('faction/chains', {
      limit: 100,
      sort: 'ASC',
      from: start,
      to: end,
    })

    return chains?.chains?.map((x) => x.id)
  }

  async #getChain(id: number): Promise<ChainReport | undefined> {
    const chain = await this.#fetch<ChainReportWrapper>(`faction/${id}/chainreport`)

    return chain?.chainreport
  }

  async getRevives(
    factionId: number,
    start: number,
    end: number,
  ): Promise<{ [playerId: number]: number }> {
    const playerRevives: { [playerId: number]: number } = {}

    const query: { [key: string]: string | number } = {
      filters: 'incoming',
      limit: 1000,
      sort: 'ASC',
      from: start,
      striptags: 'true',
    }

    if (end > start) {
      query.end = end
    }

    let revives: ReviveLog | null = await this.#fetch<ReviveLog>('faction/revivesFull', query)

    while (revives?.revives?.length) {
      for (const revive of revives?.revives) {
        if (revive.reviver?.faction_id === factionId && revive.target?.faction_id === factionId) {
          if (!playerRevives[revive.reviver.id]) {
            playerRevives[revive.reviver.id] = 1
          } else {
            playerRevives[revive.reviver.id]++
          }
        }
      }

      if (revives._metadata?.links?.next) {
        revives = await this.#fetch<ReviveLog>(revives._metadata.links.next)
      } else {
        revives = null
      }
    }

    return playerRevives
  }

  async getLosses(
    defender: number,
    attacker: number,
    start: number,
    end: number,
  ): Promise<{ [playerId: number]: number }> {
    const playerDefends: { [playerId: number]: number } = {}

    const query: { [key: string]: string | number } = {
      filters: 'incoming',
      limit: 1000,
      sort: 'ASC',
      from: start,
    }

    if (end > start) {
      query.end = end
    }

    let attacks: AttackLog | null = await this.#fetch<AttackLog>('faction/attacksfull', query)

    while (attacks?.attacks?.length) {
      for (const attack of attacks?.attacks) {
        if (attack.attacker?.faction_id === attacker && attack.defender?.faction_id === defender) {
          if (!playerDefends[attack.defender.id]) {
            playerDefends[attack.defender.id] = 1
          } else {
            playerDefends[attack.defender.id]++
          }
        }
      }

      if (attacks._metadata?.links?.next) {
        attacks = await this.#fetch<AttackLog>(attacks._metadata.links.next)
      } else {
        attacks = null
      }
    }

    return playerDefends
  }

  public async getChainReports(
    start: number,
    end: number,
  ): Promise<{ [playerId: number]: PlayerChainReport }> {
    const chainIds = await this.#getChainIds(start, end)
    if (!chainIds?.length) {
      return {}
    }

    const chains: { [playerId: number]: PlayerChainReport } = {}

    for (const chain of chainIds) {
      const chainReport = await this.#getChain(chain)
      if (chainReport) {
        for (const bonus of chainReport.bonuses) {
          const bonusRespect = bonus.respect > 10 ? bonus.respect - 10 : 0
          if (!chains[bonus.attacker_id]) {
            chains[bonus.attacker_id] = { id: bonus.attacker_id, assists: 0, bonus: bonusRespect }
          } else {
            chains[bonus.attacker_id].bonus += bonusRespect
          }
        }

        for (const attack of chainReport.attackers) {
          if (!chains[attack.id]) {
            chains[attack.id] = { id: attack.id, assists: attack.attacks?.assists ?? 0, bonus: 0 }
          } else {
            chains[attack.id].assists += attack.attacks?.assists ?? 0
          }
        }
      }
    }

    return chains
  }

  public async getWarReport(): Promise<{ factionId: number; rankedWar: RankedWar } | undefined> {
    const factionId = await this.#getFactionId()

    if (!factionId) {
      return undefined
    }

    const lastWar = await this.#getLastWar(factionId)

    if (!lastWar) {
      return undefined
    }

    const rankedWar = await this.#fetch<RankedWar>(`faction/${lastWar}/rankedwarreport`)

    return { factionId, rankedWar }
  }
}

interface FactionInfo {
  basic: {
    id: number
    name: string
    tag: string
    tag_image: string
    leader_id: number
    co_leader_id: number
    respect: number
    days_old: number
    capacity: number
    members: number
    is_enlisted: boolean
    rank: {
      level: number
      name: string
      division: number
      position: number
      wins: number
    }
    best_chain: number
  }
}

interface Wars {
  rankedwars: {
    id: number
    start: number
    end: number
    target: number
    winner: string | null
    factions: {
      id: number
      name: string
      score: number
      chain: number
    }[]
  }[]
}

interface WarFaction {
  id: number
  name: string
  score: number
  attacks: number
  rank: {
    before: string
    after: string
  }
  rewards: WarRewards
  members: FactionMember[]
}

interface RankedWar {
  rankedwarreport: {
    id: number
    start: number
    end: number
    winner: number
    forfeit: boolean
    factions: WarFaction[]
  }
}

interface FactionMember {
  id: number
  name: string
  level: number
  attacks: number
  score: number
}

interface WarRewards {
  respect: number
  points: number
  items: RewardItem[]
}

interface RewardItem {
  id: number
  name: string
  quantity: number
}

interface PlayerChainReport {
  id: number
  bonus: number
  assists: number
}

interface Chains {
  chains: {
    id: number
    chain: number
    respect: number
    start: number
    end: number
  }[]
  _metadata: {
    links: {
      prev: string
      next: string
    }
  }
}

interface ChainReportWrapper {
  chainreport: ChainReport
}

interface ChainReport {
  id: number
  faction_id: number
  start: number
  end: number
  details: {
    chain: number
    respect: number
    members: number
    targets: number
    war: number
    best: number
    leave: number
    mug: number
    hospitalize: number
    assists: number
    retaliations: number
    overseas: number
    draws: number
    escapes: number
    losses: number
  }
  bonuses: {
    attacker_id: number
    defender_id: number
    chain: number
    respect: number
  }[]
  attackers: {
    id: number
    respect: {
      total: number
      average: number
      best: number
    }
    attacks: {
      total: number
      leave: number
      mug: number
      hospitalize: number
      assists: number
      retaliations: number
      overseas: number
      draws: number
      escapes: number
      losses: number
      war: number
      bonuses: number
    }
  }[]
  non_attackers: number[]
}

interface AttackLog {
  attacks: {
    id: number
    code: string
    started: number
    ended: number
    attacker: {
      id: number
      faction_id: number
    }
    defender: {
      id: number
      faction_id: number
    }
    result: string
    respect_gain: number
    respect_loss: number
  }[]
  _metadata: {
    links: {
      next: string
      prev: string
    }
  }
}

interface ReviveLog {
  revives: {
    id: number
    reviver: {
      id: number
      faction_id: number
    }
    target: {
      id: number
      faction_id: number
      hospital_reason: string
      early_discharge: boolean
      last_action: number
      online_status: string
    }
    success_chance: number
    result: string
    timestamp: number
  }[]
  _metadata: {
    links: {
      next: string
      prev: string
    }
  }
}
