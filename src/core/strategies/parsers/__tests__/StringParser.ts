import { StringParser } from '../StringParser'

describe('StringParser', () => {
  let stringParser: StringParser

  beforeEach(() => {
    stringParser = new StringParser()
  })

  it('should parse a well-formed string into JSON', () => {
    const inputString =
      'ProductID*4*8*15*16*23~AddressID*42*108*3*14~ContactID*59*26~'
    const expectedOutput = {
      ProductID: [
        {
          ProductID1: '4',
          ProductID2: '8',
          ProductID3: '15',
          ProductID4: '16',
          ProductID5: '23',
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

    const result = stringParser.parse(inputString, {})
    expect(result).toEqual(expectedOutput)
  })

  it('should parse a string with custom delineators into JSON', () => {
    const inputString = 'ContactID^59^26|'
    const options = {
      segmentDelineator: '|',
      elementDelineator: '^',
    }
    const expectedOutput = {
      ContactID: [
        {
          ContactID1: '59',
          ContactID2: '26',
        },
      ],
    }

    const result = stringParser.parse(inputString, options)
    expect(result).toEqual(expectedOutput)
  })

  it('should throw an error for non-string input', () => {
    const inputData = { invalid: 'data' }

    expect(() => {
      stringParser.parse(inputData, {})
    }).toThrow('Data is not a valid string')
  })

  it('should throw an error for empty string input', () => {
    const inputString = '   '

    expect(() => {
      stringParser.parse(inputString, {})
    }).toThrow('No segments found in string data')
  })

  it('should handle multi character delineators', () => {
    const inputString = 'ItemID--1--2--3||'
    const options = {
      segmentDelineator: '||',
      elementDelineator: '--',
    }
    const expectedOutput = {
      ItemID: [
        {
          ItemID1: '1',
          ItemID2: '2',
          ItemID3: '3',
        },
      ],
    }

    const result = stringParser.parse(inputString, options)
    expect(result).toEqual(expectedOutput)
  })
})
