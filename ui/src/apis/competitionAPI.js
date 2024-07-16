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

// #region Competition /c
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

export async function getCompetition(competitionID) {
  try {
    const response = await fetch(`${window.VBC_API_URL}/c/${competitionID}`, { credentials: 'include' })
    checkResponse(response)
    const competitionJSON = await response.text()
    const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
    return competition
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
    const newCompetition = await response.json()
    return newCompetition
  } catch (error) {
    throw error
  }
}

export async function updateCompetition(competitionID, competitionUpdate) {
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
      url = `${url}/delete`
    }
    const response = await fetch(url, {
      method,
      mode: "cors",
      credentials: 'include'
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

// #endregion

// #region Player /c/{c}/p
export async function createPlayer(competitionID, player) {
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
    await checkResponse(response)
    const newPlayer = await response.json()
    return newPlayer
  } catch (error) {
    throw error
  }
}

export async function updatePlayer(competitionID, playerID, playerUpdate) {
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
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

export async function deletePlayer(competitionID, playerID) {
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
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}
// #endregion


// #region Match /c/{c}/s/{s}/g/{g}/m
export async function updateMatch(competitionID, stageID, groupID, matchID, matchUpdate) {
  try {
    let method = 'PUT'
    let url = `${window.VBC_API_URL}/c/${competitionID}/s/${stageID}/g/${groupID}/m/${matchID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${url}/put`
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
// #endregion
