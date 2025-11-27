import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { TransformController } from '../TransformController'
import { TransformerService } from '@/core/services/TransformerService'
import { UnsupportedTypeError } from '@/core/domain/errors'

// 1. Mock the Service Class
// We tell Vitest to replace the actual implementation with an auto-mocked version.
vi.mock('@/core/services/TransformerService')

describe('TransformController', () => {
  let controller: TransformController
  let mockService: TransformerService

  // Mocks for Express objects
  let req: Partial<Request>
  let res: Partial<Response>
  let next: any

  beforeEach(() => {
    vi.clearAllMocks()

    // mockService = new TransformerService({} as any);
    mockService = {
      execute: vi.fn(),
    } as unknown as TransformerService
    controller = new TransformController(mockService)

    req = {
      body: {},
      headers: {},
      query: {},
    }

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      type: vi.fn(),
    }

    next = vi.fn()
  })

  it('should return 400 if "outputType" query parameter is missing', async () => {
    req.query = {} // No outputType provided

    await controller.transform(req as Request, res as Response, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith({
      error: 'outputType query parameter is required.',
    })
    expect(mockService.execute).not.toHaveBeenCalled()
  })

  it('should successfully transform data and return 200', async () => {
    req.body = { foo: 'bar' }
    req.headers = { 'content-type': 'text/plain' }
    req.query = { outputType: 'xml' }

    const mockXmlResult = '<foo>bar</foo>'
    ;(mockService.execute as any).mockReturnValue(mockXmlResult)

    await controller.transform(req as Request, res as Response, next)

    expect(mockService.execute).toHaveBeenCalledWith(
      { foo: 'bar' },
      'json',
      'xml',
      expect.objectContaining({
        segmentDelineator: undefined,
        elementDelineator: undefined,
      })
    )

    expect(res.type).toHaveBeenCalledWith('application/xml')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(mockXmlResult)
  })

  it('should correctly pass delimiters from query params to the service', async () => {
    req.body = 'A|B,C|D'
    req.query = {
      outputType: 'json',
      segmentDelineator: '|',
      elementDelineator: ',',
    }

    await controller.transform(req as Request, res as Response, next)

    expect(mockService.execute).toHaveBeenCalledWith(
      'A|B,C|D',
      'string',
      'json',
      {
        segmentDelineator: '|',
        elementDelineator: ',',
      }
    )
  })

  it('should catch UnsupportedTypeError and return 400 (Client Error)', async () => {
    req.query = { outputType: 'yaml' }

    // Simulate the service throwing a Domain Error
    const domainError = new UnsupportedTypeError(
      "Output type 'yaml' is not supported."
    )
    ;(mockService.execute as any).mockImplementation(() => {
      throw domainError
    })

    await controller.transform(req as Request, res as Response, next)

    // Should be handled inside the controller, NOT passed to next()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).not.toHaveBeenCalled()
  })
})
