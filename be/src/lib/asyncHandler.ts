import type { NextFunction, ParamsDictionary, Query, Request, RequestHandler, Response } from 'express-serve-static-core'

export function asyncHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
  return (req, res, next) => {
    handler(req, res, next).catch(next)
  }
}
