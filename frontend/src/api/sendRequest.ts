import { AuthenticationKey, encodeAuthenticatedRequest } from './authentication';
import { deserialize, serialize, validate } from '@lib/dto';
import { APIRequest } from './requestsFromStructure';

interface APIResponseStatus {
  ok: boolean;
  code: number;
  message: string;
}

type APIResponse<TResult> =
  | {
      status: APIResponseStatus;
      result: null;
      error: Error;
    }
  | {
      status: APIResponseStatus;
      result: TResult;
      error: null;
    };

async function sendRequest<TInput, TResult>(
  request: APIRequest<TInput, TResult>,
  input: TInput,
  origin: string,
  authKey: AuthenticationKey | null
): Promise<APIResponse<TResult>> {
  try {
    let body = serialize(input, request.input);

    if (request.isAuthenticated) {
      if (authKey == null)
        return {
          status: {
            ok: false,
            code: 401,
            message: 'Unauthorized'
          },
          result: null,
          error: new Error('Unauthorized')
        };

      body = await encodeAuthenticatedRequest(body, authKey);
    }

    const req = await fetch(origin + request.path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body
    });

    const status: APIResponseStatus = {
      ok: req.ok,
      code: req.status,
      message: req.statusText
    };

    if (!status.ok)
      return {
        status,
        result: null,
        error: new Error(req.statusText)
      };

    const response = await req.arrayBuffer();

    const result = deserialize(new Uint8Array(response), request.result);
    if (!validate(result, request.result)) throw new Error('Server responded with an invalid object!');

    return { status, result, error: null };
  } catch (error: any) {
    return {
      status: {
        ok: false,
        code: -1,
        message: error.message
      },
      result: null,
      error
    };
  }
}

export { APIResponse, APIResponseStatus, sendRequest };
