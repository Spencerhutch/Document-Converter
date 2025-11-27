import { UnsupportedTypeError } from '@/core/domain/errors'
import { TransformerService } from '@/core/services/TransformerService'
import { Request, Response, NextFunction } from 'express'

export class TransformController {
  constructor(private service: TransformerService) {}

  public transform = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = req.body

      if (!data) {
        return res.status(400).send({ error: 'Request body is required.' })
      }

      const outputType = req.query.outputType as string
      const inputType = data ? this.detectInputType(data) : null

      if (!outputType) {
        return res
          .status(400)
          .send({ error: 'outputType query parameter is required.' })
      }

      if (!inputType) {
        return res
          .status(400)
          .send({ error: 'Unable to detect input data type.' })
      }

      const options = {
        segmentDelineator: req.query.segmentDelineator as string,
        elementDelineator: req.query.elementDelineator as string,
      }

      const result = await this.service.execute(
        data,
        inputType,
        outputType,
        options
      )
      this.setResponseHeaders(res, outputType)

      return res.status(200).send(result)
    } catch (error) {
      if (error instanceof UnsupportedTypeError) {
        return res.status(400).json({ error: error.message })
      }
      next(error)
    }
  }

  private detectInputType(data: unknown): string {
    if (!data) {
      throw new Error('No data provided for type detection')
    }

    if (typeof data === 'object') {
      return 'json'
    }

    const trimmed = (typeof data === 'string' ? data.trim() : data).toString()

    // Simple Heuristics - Can be expanded for YAML, CSV, etc.
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json'
    }
    if (trimmed.startsWith('<')) {
      return 'xml'
    }

    // Default fallback
    return 'string'
  }

  private setResponseHeaders(res: Response, type: string): void {
    if (type.includes('json')) res.type('application/json')
    else if (type.includes('xml')) res.type('application/xml')
    else res.type('text/plain')
  }
}
