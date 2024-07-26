// import Ajv from 'ajv'
// import addFormats from 'ajv-formats'

import { Competition } from '@vbcompetitions/competitions'
import { validateClubCreate,
  validateClubUpdate,
  validateContactCreate,
  validateContactUpdate,
  validateGroupAppend,
  validateGroupUpdate,
  validateMatchResultUpdate,
  validateMatchUpdate,
  validatePlayerCreate,
  validatePlayerTransfer,
  validatePlayerUpdate,
  validateStageAppend,
  validateStageUpdate,
  validateTeamCreate,
  validateTeamUpdate
} from './competitionSchema'

export default class CompetitionAPI {
  constructor() {}

  async #checkResponse(response) {
    if (!response.ok) {
      let err
      const body = await response.json()
      err = new Error(`${body.text} [id:${body.id}]`)
      err.status = response.status

      throw err
    }
  }

  // #region Competition /c
  async getCompetitions() {
    try {
      let response = await fetch(`${window.VBC_API_URL}/c`, { credentials: 'include' })
      await this.#checkResponse(response)
      const competitionList = await response.json()
      return competitionList
    } catch (error) {
      throw error
    }
  }

  async getCompetition(competitionID) {
    try {
      const response = await fetch(`${window.VBC_API_URL}/c/${competitionID}`, { credentials: 'include' })
      await this.#checkResponse(response)
      const competitionJSON = await response.text()
      const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
      return competition
    } catch (error) {
      throw error
    }
  }

  async createCompetition(competition) {
    try {
      const response = await fetch(`${window.VBC_API_URL}/c`, {
        method: 'POST',
        mode: "cors",
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(competition)
      })
      await this.#checkResponse(response)
      const newCompetition = await response.json()
      return newCompetition
    } catch (error) {
      throw error
    }
  }

  async updateCompetition(competitionID, competitionUpdate) {
    try {
      let method = 'PUT'
      let url = `${window.VBC_API_URL}/c/${competitionID}`
      if (window.VBC_GET_POST_MODE) {
        method = 'POST'
        url = `${url}/put`
      }
      const response = await fetch(url, {
        method,
        mode: "cors",
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(competitionUpdate)
      })
      await this.#checkResponse(response)
    } catch (error) {
      throw error
    }
  }

  async deleteCompetition(competitionID) {
    try {
      let method = 'DELETE'
      let url = `${window.VBC_API_URL}/c/${competitionID}`
      if (window.VBC_GET_POST_MODE) {
        method = 'POST'
        url = `${url}/delete`
      }
      const response = await fetch(url, {
        method,
        mode: "cors",
        credentials: 'include'
      })
      await this.#checkResponse(response)
    } catch (error) {
      throw error
    }
  }

  // #endregion

  // #region Player /c/{c}/p
  async createPlayer(competitionID, player) {
    try {
      let method = 'POST'
      let url = `${window.VBC_API_URL}/c/${competitionID}/p`
      const response = await fetch(url, {
        method,
        mode: "cors",
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(player)
      })
      await this.#checkResponse(response)
      const newPlayer = await response.json()
      return newPlayer
    } catch (error) {
      throw error
    }
  }

  async updatePlayer(competitionID, playerID, playerUpdate) {
    try {
      let method = 'PUT'
      let url = `${window.VBC_API_URL}/c/${competitionID}/p/${playerID}`
      if (window.VBC_GET_POST_MODE) {
        method = 'POST'
        url = `${url}/put`
      }
      const response = await fetch(url, {
        method,
        mode: "cors",
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(playerUpdate)
      })
      await this.#checkResponse(response)
    } catch (error) {
      throw error
    }
  }

  async deletePlayer(competitionID, playerID) {
    try {
      let method = 'DELETE'
      let url = `${window.VBC_API_URL}/c/${competitionID}/p/${playerID}`
      if (window.VBC_GET_POST_MODE) {
        method = 'POST'
        url = `${url}/delete`
      }
      const response = await fetch(url, {
        method,
        mode: "cors",
        credentials: 'include'
      })
      await this.#checkResponse(response)
    } catch (error) {
      throw error
    }
  }
  // #endregion


  // #region Match /c/{c}/s/{s}/g/{g}/m
  async updateMatchResult(competitionID, stageID, groupID, matchID, matchUpdate) {
    if (!validateMatchResultUpdate(matchUpdate)) {
      let errors = ''
      validateMatchResultUpdate.errors.forEach(e => {
        errors += `[${e.schemaPath}] [${e.instancePath}] ${e.message}\n`
      })
      throw new Error(`Match result update data failed schema validation:\n${errors}`)
    }

    try {
      let method = 'PATCH'
      let url = `${window.VBC_API_URL}/c/${competitionID}/s/${stageID}/g/${groupID}/m/${matchID}`
      if (window.VBC_GET_POST_MODE) {
        method = 'POST'
        url = `${url}/patch`
      }
      const response = await fetch(url, {
        method,
        mode: "cors",
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(matchUpdate)
      })
      await this.#checkResponse(response)
    } catch (error) {
      throw error
    }
  }
  // #endregion

}
