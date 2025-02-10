import { AuthenticationInfo, parseAuthenticatedRequest } from './authentication';
import { deserialize, serialize, validate } from '@lib/dto';
import { APISegment } from '@api/APISegment';
import { Router } from 'express';

function bootstrapRouter(structure: readonly APISegment[], handlers: any): Router {
  const router = Router();

  for (const segment of structure) {
    if ('routes' in segment) {
      router.use(`/${segment.name}`, bootstrapRouter(segment.routes, handlers[segment.name]));
      continue;
    }

    router.post(`/${segment.name}`, async (req, res) => {
      let body = new Uint8Array(req.body.buffer, req.body.byteOffset, req.body.byteLength);

      let authenticationInfo: AuthenticationInfo | null = null;
      if (segment.isAuthenticated)
        try {
          const authenticatedRequest = await parseAuthenticatedRequest(body);
          authenticationInfo = authenticatedRequest.authenticationInfo;
          body = authenticatedRequest.body;
        } catch (error) {
          res.sendStatus(401);
          return;
        }

      let input;
      try {
        input = deserialize(body, segment.input);
        if (!validate(input, segment.input)) throw new Error();
      } catch {
        res.sendStatus(400);
        return;
      }

      try {
        const result = await handlers[segment.name](input, authenticationInfo);
        const response = serialize(result, segment.result);

        res.end(new Uint8Array(response));
      } catch {
        res.sendStatus(500);
      }
    });
  }

  return router;
}

export { bootstrapRouter };
