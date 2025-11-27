import { IFormatter } from '@/core/interfaces/IFormatter'

export class JsonFormatter implements IFormatter {
  format(data: Record<string, any>): string {
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      throw new Error(
        `Failed to format data as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
