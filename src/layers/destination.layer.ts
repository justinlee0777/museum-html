import styles from './destination-layer.module.css';

import { Cell, MuseumWall, Position } from '../models';
import { toPositions } from '../utils/to-positions.function';
import { ProposedPosition } from '../models/position.model';

interface DestinationLayerArgs {
  cellSize: number;
  height: number;
  width: number;
  walls: Array<MuseumWall>;
  cells: Array<Array<Cell>>;
}

interface DrawArgs {
  path: Array<ProposedPosition>;
}

export default class DestinationLayer {
  element: HTMLCanvasElement | undefined;

  constructor(private args: DestinationLayerArgs) {}

  draw(args?: DrawArgs): void {
    const { cellSize, height, width } = this.args;

    let { element } = this;

    if (!element) {
      element = this.element = document.createElement('canvas');
      element.className = styles.destinationLayer;
      element.height = height;
      element.width = width;
    }

    if (args) {
      const { path } = args;

      const context = element.getContext('2d')!;

      context.clearRect(0, 0, element.width, element.height);

      path.forEach(({ position: [x, y], valid }) => {
        if (valid) {
          context.strokeStyle = 'black';
        } else {
          context.strokeStyle = 'red';
        }

        context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    }
  }

  clear(): void {
    const { element } = this;

    if (element) {
      const context = element.getContext('2d')!;

      context.clearRect(0, 0, element.width, element.height);
    }
  }
}
