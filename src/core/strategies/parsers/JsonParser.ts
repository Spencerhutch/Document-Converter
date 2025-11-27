import { IParser } from '@/core/interfaces/IParser'

export class JsonParser implements IParser {
  parse(data: unknown): Record<string, any> {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data)
      } else if (
        typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data)
      ) {
        return data as Record<string, any>
      } else {
        throw new Error('Data is not a valid JSON string or object')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Invalid JSON data: ${message}`)
    }
  }
}
