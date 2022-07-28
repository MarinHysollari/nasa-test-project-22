const axios = require('axios')

const launches = require('./launches.mongo');

const DEFAULT_LAUNCH_NUMBER = 1;

async function findLaunch(filter) {
  return launches.findOne(filter)
}

async function existsLaunchWithId(flightNumber) {
  return findLaunch({
    flightNumber
  })
}

async function getAllLaunches({ skip , limit }) {
  return launches.find({}, '-_id -__v')
    .sort('flightNumber')
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch) {
  return launches.findOneAndUpdate({
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  )
}

async function saveManyLaunches(launchesData) {
  return launches.insertMany(launchesData)
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber')

  if (! latestLaunch) {
    return DEFAULT_LAUNCH_NUMBER
  }

  return latestLaunch.flightNumber
}

async function scheduleNewLaunch(launch) {
  launch.flightNumber = await getLatestFlightNumber()
  launch.customers = ['TMZ', 'NASA']
  return saveLaunch(launch)
}

async function abortLaunch(id) {
  const aborted = await launches.updateOne({
    flightNumber: id,
  }, {
    upcoming: false,
    success: false,
  })
  return aborted.modifiedCount === 1;
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })
  if (firstLaunch) {
    return console.log('Launches already loaded!')
  }
  await populateLaunches()
}

async function populateLaunches() {
  const { data } = await axios.post(process.env.SPACEX_API_URL, {
    "query": {},
    "options": {
      "pagination": false,
      "populate": [
        {
          "path": "rocket",
          "select": {
            "name": 1
          }
        },
        {
          "path": "payloads",
          "select": {
            "customers": 1
          }
        }
      ]
    }
  })

  let dataToSave = []
  const launchDocs = data.docs

  for (const launchDoc of launchDocs) {
    const customers = launchDoc['payloads'].flatMap(payload => payload['customers'])

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'] || false,
      customers
    }
    dataToSave.push(launch)
  }
  await saveManyLaunches(dataToSave)
}

module.exports = {
  getAllLaunches,
  abortLaunch,
  scheduleNewLaunch,
  existsLaunchWithId,
  loadLaunchesData,
}
