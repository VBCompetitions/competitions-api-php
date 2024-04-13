import { Competition } from '@vbcompetitions/competitions'

async function checkResponse(response) {
  if (!response.ok) {
    let err
    const body = await response.json()
    err = new Error(`${body.text} [id:${body.id}]`)
    err.status = response.status

    throw err
  }
}

//#region Competition /c
export async function getCompetitions() {
  try {
    let response = await fetch(`${window.VBC_API_URL}/c`, { credentials: 'include' })
    await checkResponse(response)
    const competitionList = await response.json()
    return competitionList
  } catch (error) {
    throw error
  }
}

export async function getCompetitionByID(competitionID) {
  try {
    const response = await fetch(`${window.VBC_API_URL}/c/${competitionID}`, { credentials: 'include' })
    checkResponse(response)
    const competitionJSON = await response.text()
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    return competition
    // setCompetitionData(competition)
    // setNewCompetitionName(competition.getName())
    // setLoading(false)
  } catch (error) {
    throw error
  }
}

export async function createCompetition(newCompetition) {
  try {
    const response = await fetch(`${window.VBC_API_URL}/c`, {
      method: 'POST',
      mode: "cors",
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newCompetition)
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

export async function updateCompetition(competitionID, competitionUpdate) {
  try {
    const response = await fetch(`${window.VBC_API_URL}/c/${competitionID}`, {
      method: 'POST',
      mode: "cors",
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(competitionUpdate)
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

export async function deleteCompetition(competitionID) {
  try {
    let method = 'DELETE'
    let url = `${window.VBC_API_URL}/c/${competitionID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${window.VBC_API_URL}/c/${competitionID}/delete`
    }
    const response = await fetch(url, {
      method,
      mode: "cors"
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

//#regionend

//#region Match /c/_/s/_/g/_/m
export async function updateMatch(competitionID, stageID, groupID, matchID, matchUpdate) {
  try {
    let method = 'PUT'
    let url = `${window.VBC_API_URL}/c/${competitionID}/s/${stageID}/g/${groupID}/m/${matchID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${window.VBC_API_URL}/c/${competitionID}/s/${stageID}/g/${groupID}/m/${matchID}/put`
    }
    const response = await fetch(url, {
      method,
      mode: "cors",
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(matchUpdate)
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}
//#regionend
