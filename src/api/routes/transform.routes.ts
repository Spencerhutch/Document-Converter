import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import express, {
  type NextFunction,
  type Request,
  type Response,
  type Router,
} from 'express'
import { z } from 'zod'

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders'
import { TransformController } from '../controllers/TransformController'
import { StrategyFactory } from '@/core/strategies/StrategyFactory'
import { TransformerService } from '@/core/services/TransformerService'

export const transformRegistry = new OpenAPIRegistry()
export const transformRouter: Router = express.Router()

transformRegistry.registerPath({
  method: 'post',
  path: '/transform',
  tags: ['Transform'],
  parameters: [
    {
      name: 'outputType',
      in: 'query',
      required: true,
      description: 'The desired output format',
      schema: {
        type: 'string',
        enum: ['json', 'xml', 'string'],
      },
    },
    {
      name: 'segmentDelineator',
      in: 'query',
      required: false,
      description:
        'The segment delineator to use in string formatting (default: ~)',
      schema: {
        type: 'string',
      },
    },
    {
      name: 'elementDelineator',
      in: 'query',
      required: false,
      description:
        'The element delineator to use in string formatting (default: *)',
      schema: {
        type: 'string',
      },
    },
  ],
  requestBody: {
    description: 'The data to be transformed',
    required: true,
    content: {
      'application/json': { schema: {} },
      // 'application/xml': { schema: {} },
      'text/plain': { schema: {} },
    },
  },
  responses: createApiResponse(z.null(), 'Success'),
})

const strategyFactory = new StrategyFactory()

const transformerService = new TransformerService(strategyFactory)

const transformController = new TransformController(transformerService)

transformRouter.post('/', (req: Request, res: Response, next: NextFunction) =>
  transformController.transform(req, res, next)
)
