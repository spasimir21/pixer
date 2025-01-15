import { DTO } from '@lib/dto';

type APISegment =
  | {
      name: string;
      isAuthenticated?: boolean;
      input: DTO;
      output: DTO;
    }
  | {
      name: string;
      isAuthenticated?: boolean;
      children: APISegment[];
    };

const apiSegment = <T extends APISegment>(segment: T) => segment;

export { APISegment, apiSegment };
