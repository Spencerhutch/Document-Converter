import { IParser } from '@/core/interfaces/IParser'
import { XMLParser } from 'fast-xml-parser'

export class XmlParser implements IParser {
  parse(data: string): Record<string, any> {
    try {
      const parser = new XMLParser()
      return parser.parse(data)
    } catch (error) {
      throw new Error(
        `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
