import { AuthenticationInfo, parseAuthenticatedRequest } from './authentication';
import { deserialize, serialize, validate } from '@lib/dto';
import { toUint8Array } from '../utils/buffer';
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
      let body = toUint8Array(req.body);

      let authenticationInfo: AuthenticationInfo | null = null;
      if (segment.isAuthenticated)
        try {
          const authenticatedRequest = await parseAuthenticatedRequest(body);
          authenticationInfo = authenticatedRequest.authenticationInfo;
          body = authenticatedRequest.data;
        } catch {
          res.sendStatus(403);
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

      const result = await handlers[segment.name](input, authenticationInfo);
      const response = serialize(result, segment.result);

      res.end(new Uint8Array(response));
    });
  }

  return router;
}

export { bootstrapRouter };
