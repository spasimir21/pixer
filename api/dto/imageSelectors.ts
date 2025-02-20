import { _enum, boolean, date, DTOType, int, nullable, object } from '@lib/dto';
import { user } from './user';

const SortingProperty = _enum('User', 'Date');

const imageSelectors = object({
  filter: object({
    includeSubmissions: nullable(boolean()),
    userId: nullable(user.id),
    fromDate: nullable(date())
  }),
  sort: SortingProperty,
  skip: int()
});

type SortingProperty = DTOType<typeof SortingProperty>;
type ImageSelectors = DTOType<typeof imageSelectors>;

export { SortingProperty, imageSelectors, ImageSelectors };
