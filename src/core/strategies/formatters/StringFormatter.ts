import { IFormatter } from '@/core/interfaces/IFormatter'

export class StringFormatter implements IFormatter {
  format(data: Record<string, any>, options: Record<string, string>): string {
    const { segmentDelineator = '~', elementDelineator = '*' } = options || {}
    let result = ''

    for (const [key, records] of Object.entries(data)) {
      if (!Array.isArray(records)) continue
      records.forEach((record: Record<string, any>) => {
        const values = Object.values(record).join(elementDelineator)
        result += `${key}${elementDelineator}${values}${segmentDelineator}`
      })
    }

    return result.trim()
  }
}
