import request from 'supertest'
import { app } from '@/server'

describe('Transform API endpoints', () => {
  const TEST_STRING =
    'ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~ContactID*59*26~'
  const TEST_JSON = {
    ProductID: [
      {
        ProductID1: '4',
        ProductID2: '8',
        ProductID3: '15',
        ProductID4: '16',
        ProductID5: '23',
      },
      {
        ProductID1: 'a',
        ProductID2: 'b',
        ProductID3: 'c',
        ProductID4: 'd',
        ProductID5: 'e',
      },
    ],
    AddressID: [
      {
        AddressID1: '42',
        AddressID2: '108',
        AddressID3: '3',
        AddressID4: '14',
      },
    ],
    ContactID: [
      {
        ContactID1: '59',
        ContactID2: '26',
      },
    ],
  }

  it('POST /transform - success', async () => {
    const response = await request(app)
      .post('/transform')
      .send('hello world')
      .query({ outputType: 'json' })
    const result = response.body

    expect(response.statusCode).toEqual(200)
  })

  it('POST /transform - if no output type fail', async () => {
    const response = await request(app)
      .post('/transform')
      .send('hello world')
      .query({})
    const result = response.body

    expect(response.statusCode).toEqual(400)
    expect(result.error).toEqual('outputType query parameter is required.')
  })

  it('POST /transform - body is required', async () => {
    const response = await request(app)
      .post('/transform')
      .query({ outputType: 'json' })
    const result = response.body

    expect(response.statusCode).toEqual(400)
    expect(result.error).toEqual('Request body is required.')
  })

  ////
  // Delineators are set with defaults for now.
  ////

  // it('POST /transform - if input type of String, delineators are required', async () => {
  //   const response = (await request(app).post('/transform').send(TEST_STRING).query({ outputType: 'json' }));
  //   const result = response.body;

  //   expect(response.statusCode).toEqual(400);
  //   expect(result.error).toEqual("Input type of string requires delineators defined.");
  // });

  // it('POST /transform - if output type of String, delineators are required', async () => {
  //   const response = (await request(app).post('/transform').send(TEST_JSON).query({ outputType: 'string' }));
  //   const result = response.body;

  //   expect(response.statusCode).toEqual(400);
  //   expect(result.error).toEqual("Output type of string requires delineators defined.");
  // });
})
