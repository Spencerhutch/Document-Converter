import { IStrategyFactory } from '../interfaces/IStrategyFactory'

export class TransformerService {
  constructor(private factory: IStrategyFactory) {}

  public execute(
    data: unknown,
    inputType: string,
    outputType: string,
    options?: Record<string, string>
  ): unknown {
    const parser = this.factory.getParser(inputType)
    const formatter = this.factory.getFormatter(outputType)

    const intermediateData = parser.parse(data, options)
    return formatter.format(intermediateData, options)
  }
}
