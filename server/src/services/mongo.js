require('dotenv').config()
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once('open', () => {
  console.log('Mongo db connection ready!')
})

mongoose.connection.on('error', (error) => {
  console.error(error)
})

async function mongoConnect() {
  console.log('MONGO_URL => ', MONGO_URL)
  await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
  await mongoose.disconnect()
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
}
