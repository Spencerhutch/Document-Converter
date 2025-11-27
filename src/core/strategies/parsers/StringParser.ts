import { IParser } from '@/core/interfaces/IParser'

export class StringParser implements IParser {
  parse(data: unknown, options?: Record<string, string>): Record<string, any> {
    if (typeof data === 'string') {
      const { segmentDelineator = '~', elementDelineator = '*' } = options || {}

      const segments = data.trim().split(segmentDelineator)

      if (
        segments.length === 0 ||
        (segments.length === 1 && segments[0].trim() === '')
      ) {
        throw new Error('No segments found in string data')
      }

      const results: Record<string, Record<string, string>[]> = {}

      segments.forEach((segment, index) => {
        const elements = segment.trim().split(elementDelineator)
        if (elements.length > 0) {
          const primaryKey: string = elements[0].trim()
          const values = elements.slice(1)

          const record: Record<string, string> = {}

          values.forEach((value, index) => {
            const keyName = `${primaryKey}${index + 1}`
            record[keyName] = value.trim()
          })

          if (!results[primaryKey]) {
            results[primaryKey] = []
          }

          results[primaryKey].push(record)
        }
      })

      return results
    }
    throw new Error('Data is not a valid string')
  }
}
