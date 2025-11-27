export interface IFormatter {
  format(data: Record<string, any>, options?: Record<string, string>): unknown
}
