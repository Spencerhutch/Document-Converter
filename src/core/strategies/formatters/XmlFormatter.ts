import { IFormatter } from '@/core/interfaces/IFormatter'
import { XMLBuilder } from 'fast-xml-parser'

export class XmlFormatter implements IFormatter {
  format(data: Record<string, any>): string {
    const builder = new XMLBuilder()
    return builder.build(data)
  }
}
