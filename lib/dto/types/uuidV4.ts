import { string } from './string';
import { _const } from './const';

const uuidV4 = () =>
  string({
    length: _const(36),
    pattern: /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/
  });

export { uuidV4 };
