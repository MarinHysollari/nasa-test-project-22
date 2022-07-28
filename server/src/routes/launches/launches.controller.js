const { scheduleNewLaunch, getAllLaunches, abortLaunch, existsLaunchWithId } = require('../../models/launches.model')
const { getPagination } = require('../../services/query')

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query)

  return res.status(200).json(await getAllLaunches({ skip, limit }))
}

async function httpAddNewLaunch(req, res) {
  const launchBody = { ...req.body }
  if (
    !launchBody.mission ||
    !launchBody.rocket ||
    !launchBody.launchDate ||
    !launchBody.target
  ) {
    return res.status(422).json({
      error: 'Missing required launch property'
    })
  }
  launchBody.launchDate = new Date(launchBody.launchDate)

  if (isNaN(launchBody.launchDate)) {
    return res.status(422).json({
      error: 'Date is in invalid format'
    })
  }

  let launch = await scheduleNewLaunch(launchBody)
  console.log(launch)
  return res.status(201).json(launch)
}

async function httpAbortLaunch(req, res) {
  const { id } = req.params
  const existsLaunch = await existsLaunchWithId(id)
  if (! existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found'
    })
  }

  const aborted = await abortLaunch(parseInt(id))
  if (aborted) {
    return res.status(200).json({
      ok: true
    })
  }
  return res.status(400).json({
    error: 'Launch not aborted'
  })
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
}
