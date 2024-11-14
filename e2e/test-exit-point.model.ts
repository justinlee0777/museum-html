import { ExitPoint, Position } from '../index';

export interface TestExitPointData {
  enteringRoomId: string;
  playerPosition: Position;
}

export type TestExitPoint = ExitPoint<TestExitPointData>;
