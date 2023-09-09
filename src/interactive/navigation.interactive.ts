import NullaryFn from '@justinlee0777/components/types/nullary-function';

import Direction from '../models/direction.enum';

type DirectionListeners = {
  [direction in Direction]?: NullaryFn;
};

export default interface NavigationInteractive extends DirectionListeners {}
