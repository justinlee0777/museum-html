import { MuseumArgs } from '../index';
import { TestExitPointData } from './test-exit-point.model';

export type MuseumPartial = Omit<
  MuseumArgs<TestExitPointData>,
  'playerPosition' | 'registries'
> & { id: string };
