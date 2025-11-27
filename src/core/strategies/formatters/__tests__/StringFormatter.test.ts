import { StringFormatter } from '../StringFormatter'

describe('StringFormatter', () => {
  let stringFormatter: StringFormatter

  beforeEach(() => {
    stringFormatter = new StringFormatter()
  })

  it('should format data into a string with default delineators', () => {
    const inputData = {
      ProductID: [{ ProductID1: '4', ProductID2: '8', ProductID3: '15' }],
      AddressID: [{ AddressID1: '42', AddressID2: '108' }],
    }

    const expectedOutput = `ProductID*4*8*15~AddressID*42*108~`

    const result = stringFormatter.format(inputData, {})
    expect(result).toEqual(expectedOutput)
  })

  it('should format data into a string with custom delineators', () => {
    const inputData = {
      ContactID: [{ ContactID1: '59', ContactID2: '26' }],
    }

    const options = {
      segmentDelineator: '|',
      elementDelineator: '^',
    }

    const expectedOutput = `ContactID^59^26|`

    const result = stringFormatter.format(inputData, options)
    expect(result).toEqual(expectedOutput)
  })

  it('should return an empty string for an empty input object', () => {
    const result = stringFormatter.format({}, {})
    expect(result).toBe('')
  })

  it('should correctly handle records with varying field counts (regression test)', () => {
    const varyingJson = {
      Widget: [
        { Widget1: 'A', Widget2: 'B' }, // 2 fields
      ],
      Gadget: [
        { Gadget1: 'X', Gadget2: 'Y', Gadget3: 'Z' }, // 3 fields
      ],
    }
    const expected = 'Widget*A*B~Gadget*X*Y*Z~'
    const result = stringFormatter.format(varyingJson, {
      segmentDelineator: '~',
      elementDelineator: '*',
    })
    expect(result).toBe(expected)
  })

  it('should handle multi character delineators', () => {
    const inputData = {
      Item: [{ Item1: '1', Item2: '2' }],
    }

    const options = {
      segmentDelineator: '||',
      elementDelineator: '^^',
    }

    const expectedOutput = `Item^^1^^2||`

    const result = stringFormatter.format(inputData, options)
    expect(result).toEqual(expectedOutput)
  })
})
