import { IParser } from './IParser'
import { IFormatter } from './IFormatter'

export interface IStrategyFactory {
  getParser(type: string, options?: Record<string, string>): IParser
  getFormatter(type: string, options?: Record<string, string>): IFormatter
}
