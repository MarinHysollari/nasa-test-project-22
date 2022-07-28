const API_URL = 'http://localhost:5000/v1'
async function httpGetPlanets() {
  const res = await fetch(`${API_URL}/planets`)
  return await res.json()
}

async function httpGetLaunches() {
  const res = await fetch(`${API_URL}/launches`)
  const jsonRes = await res.json()
  return jsonRes.sort((a, b) => a.flightNumber - b.flightNumber)
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, {
      method: 'POST',
      body: JSON.stringify(launch),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (e) {
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'DELETE',
    })
  } catch (e) {
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};
