import { _enum, boolean, date, DTOType, int, nullable, object } from '@lib/dto';
import { user } from './user';

const SortingOrder = _enum('User', 'Date');

const imageSelectors = object({
  filter: object({
    isSubmission: nullable(boolean()),
    userId: nullable(user.id),
    fromDate: nullable(date())
  }),
  sort: SortingOrder,
  skip: int()
});

type ImageSelectors = DTOType<typeof imageSelectors>;
type SortingOrder = DTOType<typeof SortingOrder>;

export { SortingOrder, imageSelectors, ImageSelectors };
