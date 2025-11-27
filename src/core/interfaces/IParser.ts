export interface IParser {
  parse(data: unknown, options?: Record<string, string>): Record<string, string>
}
