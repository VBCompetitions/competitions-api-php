export class States {
  static ACTIVE = 'active'
  static SUSPENDED = 'suspended'
  static PENDING = 'pending'
}

async function checkResponse(response) {
  if (!response.ok) {
    let err
    const body = await response.json()
    err = new Error(`${body.text} [id:${body.id}]`)
    err.status = response.status

    throw err
  }
}

//#region User /u
export async function getUsers () {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/u`, { credentials: 'include' })
    await checkResponse(response)
    const userList = await response.json()
    return userList
  } catch (error) {
    throw error
  }
}

export async function createUser (username, roles, app) {
  const newUser = { username, roles, app }
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/u`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    await checkResponse(response)
    const user = await response.json()
    return user
  } catch (error) {
    throw error
  }
}

export async function updateUser (userID, state, roles) {
  const userUpdate = { state, roles }
  try {
    let method = 'PATCH'
    let url = `${window.VBC_UIDATA_URL}/u/${userID}`

    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${window.VBC_UIDATA_URL}/u/${userID}/patch`
    }

    const response = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(userUpdate)
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

export async function resetUser (userID) {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/u/${userID}/reset`, { credentials: 'include' })
    await checkResponse(response)
    const user = await response.json()
    return user
  } catch (error) {
    throw error
  }
}

export async function deleteUser (userID) {
  try {
    let method = 'DELETE'
    let url = `${window.VBC_UIDATA_URL}/u/${userID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${window.VBC_UIDATA_URL}/u/${userID}/delete`
    }
    const response = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'include'
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}
//#endregion

//#region Account /a
export async function getAccount () {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/a`, { credentials: 'include' })
    await checkResponse(response)
    const userInfo = await response.json()
    userInfo.loggedIn = true
    return userInfo
  } catch (error) {
    throw error
  }
}

export async function updateAccount(newUsername, newPassword) {
  const accountUpdate = { newUsername, newPassword }
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/a`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(accountUpdate)
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

export async function getUsernameFromLinkID (linkID) {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/a/${linkID}`, { credentials: 'include' })
    await checkResponse(response)
    return await response.json()
  } catch (error) {
    throw error
  }
}
//#endregion

//#region Keys /k
export async function getKeys () {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/k`, { credentials: 'include' })
    await checkResponse(response)
    const apiKeys = await response.json()
    return apiKeys
  } catch (error) {
    throw error
  }
}

export async function createKey (description) {
  const newKey = { description }
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/k`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newKey)
    })
    await checkResponse(response)
    return await response.json()
  } catch (error) {
    throw error
  }
}

export async function updateKey (keyID, description) {
  const updateKey = { description }
  try {
    let method = 'PATCH'
    let url = `${window.VBC_UIDATA_URL}/k/${keyID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${url}/patch`
    }
    const response = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updateKey)
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

export async function deleteKey (keyID) {
  try {
    let method = 'DELETE'
    let url = `${window.VBC_UIDATA_URL}/k/${keyID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${url}/delete`
    }
    const response = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'include'
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

//#endregion

//#region Logs /s

export async function getSystemLogs () {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/s/logs`, { credentials: 'include' })
    await checkResponse(response)
    return await response.text()
  } catch (error) {
    throw error
  }
}

//#endregion

//#region Apps /s

export async function getApps () {
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/s/apps`, { credentials: 'include' })
    await checkResponse(response)
    return await response.json()
  } catch (error) {
    throw error
  }
}

export async function createApp (name, rootPath, roles) {
  const newApp = { name, rootPath, roles }
  try {
    const response = await fetch(`${window.VBC_UIDATA_URL}/s/apps`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newApp)
    })
    await checkResponse(response)
    return await response.json()
  } catch (error) {
    throw error
  }
}

export async function deleteApp (appID) {
  try {
    let method = 'DELETE'
    let url = `${window.VBC_UIDATA_URL}/s/apps/${appID}`
    if (window.VBC_GET_POST_MODE) {
      method = 'POST'
      url = `${url}/delete`
    }
    const response = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'include'
    })
    await checkResponse(response)
  } catch (error) {
    throw error
  }
}

//#endregion
