const app = require('../../app');
const request  =require('supertest')
const { mongoConnect, mongoDisconnect } = require('../../services/mongo')
const { loadPlanetsData } = require("../../models/planets.model");

jest.useRealTimers();

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect()
    await loadPlanetsData()
  })
  describe('Test GET /launches', () => {
    test('It should respond with 200 success!', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.statusCode).toBe(200)
    })
  })

  describe('Test POST /launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-186 f',
      launchDate: 'January 4, 2028'
    }
    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-186 f',
    }

    test('It should respond with 201 success!', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf()
      const responseDate = new Date(response.body.launchDate).valueOf()

      expect(responseDate).toBe(requestDate)
      expect(response.body).toMatchObject(launchDataWithoutDate)
    })
    test('Should catch missing required properties!', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property'
      })
    })
    test('Should catch invalid dates!', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send({
          ...launchDataWithoutDate,
          launchDate: 'Wrong format date!'
        })
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body).toStrictEqual({
        error: 'Date is in invalid format'
      })
    })
  })
  afterAll(async () => {
    await mongoDisconnect()
  })
})
