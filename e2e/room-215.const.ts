import { MuseumPartial } from './museum-partial.model';
import { TestExitPoint } from './test-exit-point.model';

const height = 8;
const width = 8;

const cellSize = 48;

const eastExitPoint: TestExitPoint = {
  origin: [0, 3],
  height: 3,
  width: 1,
  metadata: {
    enteringRoomId: 'room216',
    playerPosition: [14, 4],
  },
};

export const room215Args: MuseumPartial = {
  id: 'room215',
  height,
  width,
  cellSize,
  objects: [],
  walls: [
    {
      origin: [0, height - 2],
      height: 2,
    },
    {
      origin: [0, 0],
      height: 3,
    },
    {
      origin: [0, 0],
      width: width - 3,
    },
    {
      origin: [width - 1, 0],
      height: 3,
    },
    {
      origin: [width - 1, height - 2],
      height: 2,
    },
    {
      origin: [0, height - 1],
      width,
    },
  ],
  exitPoints: [eastExitPoint],
};
