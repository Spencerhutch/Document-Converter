import { UnsupportedTypeError } from '../domain/errors'

import { IParser } from '../interfaces/IParser'
import { IFormatter } from '../interfaces/IFormatter'
import { IStrategyFactory } from '../interfaces/IStrategyFactory'

import { JsonParser } from './parsers/JsonParser'
import { XmlParser } from './parsers/XmlParser'

import { JsonFormatter } from './formatters/JsonFormatter'
import { XmlFormatter } from './formatters/XmlFormatter'
import { StringParser } from './parsers/StringParser'
import { StringFormatter } from './formatters/StringFormatter'

type ParserConstructor = new () => IParser
type FormatterConstructor = new () => IFormatter

export class StrategyFactory implements IStrategyFactory {
  private parserMap: Record<string, ParserConstructor> = {
    string: StringParser,
    json: JsonParser,
    xml: XmlParser,
    // Add more parsers as needed
  }

  private formatterMap: Record<string, FormatterConstructor> = {
    string: StringFormatter,
    json: JsonFormatter,
    xml: XmlFormatter,
    // Add more formatters as needed
  }

  public getParser(type: string): IParser {
    const normalizedType = type.toLowerCase().trim()
    const ParserClass = this.parserMap[normalizedType]

    if (!ParserClass) {
      throw new UnsupportedTypeError(
        `Input of type "${type}" is not supported.`
      )
    }

    return new ParserClass()
  }

  public getFormatter(type: string): IFormatter {
    const normalizedType = type.toLowerCase().trim()
    const FormatterClass = this.formatterMap[normalizedType]

    if (!FormatterClass) {
      throw new UnsupportedTypeError(
        `Output of type "${type}" is not supported.`
      )
    }

    return new FormatterClass()
  }
}
