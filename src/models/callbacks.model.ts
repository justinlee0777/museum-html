import { ExitPoint } from './exit-point.model';

export interface OnExit<ExitPointData = void> {
  (exitPoint: ExitPoint<ExitPointData>): void;
}
