import { object, string } from '@lib/dto';
import { apiRoutes } from '../APISegment';

const APIB2 = apiRoutes({
  name: 'b2',
  routes: [
    {
      name: 'getBaseDownloadUrl',
      input: object({}),
      result: string()
    }
  ]
} as const);

export { APIB2 };
