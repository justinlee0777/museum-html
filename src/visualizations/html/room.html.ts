import styles from './room.html.module.css';

import { createKeyListener } from '@justinlee0777/components/utils/create-key-listener';

import ICell from '../../models/cell.interface';
import RoomData from '../../data/room.data';
import Position from '../../models/position.interface';
import Camera from '../../models/camera.interface';
import RoomVisualization from '../models/room-visualization.model';
import NavigationInteractive from '../../interactive/navigation.interactive';
import Direction from '../../models/direction.enum';
import NullaryFn from '@justinlee0777/components/types/nullary-function';

export default class HTMLRoom implements RoomVisualization<HTMLElement> {
  private mazeElement: HTMLElement | undefined;

  private deregisterNavigation: NullaryFn | undefined;

  constructor(private cellSize: number) {}

  public draw(data: RoomData, origin: Position, camera: Camera): HTMLElement {
    if (!this.mazeElement) {
      const mazeElement = (this.mazeElement = document.createElement('div'));
      mazeElement.className = styles.maze;
    }

    const { mazeElement } = this;

    mazeElement.style.gridTemplate = `repeat(${camera[0]}, ${this.cellSize}px) / repeat(${camera[1]}, ${this.cellSize}px)`;

    const cells = data.getCells(origin, camera, ['center', 'center']);

    const beginningCell = data.beginning;

    const drawnCells = new Set<string>();

    cells.forEach((row, j) => {
      row.forEach((cell, i) => {
        const position = [
          beginningCell[0] + i,
          beginningCell[1] + j,
        ] as Position;
        const cellId = this.getCellId(position);

        let cellElement: HTMLElement;

        if (cell) {
          cellElement = this.drawAndPositionCell(cell, [i, j]);
        } else {
          cellElement = this.drawAndPositionCell(position, [i, j]);
        }

        if (!cellElement.parentElement) {
          mazeElement.appendChild(cellElement);
        }

        drawnCells.add(cellId);
      });
    });

    Array.from(document.querySelectorAll('[id^="cell"]'))
      .filter((element) => !drawnCells.has(element.id))
      .forEach((element) => element.remove());

    return mazeElement;
  }

  public drawBlank(position: Position): HTMLElement {
    const cellId = this.getCellId(position);
    let cellElement = document.getElementById(cellId);

    if (!cellElement) {
      cellElement = document.createElement('div');
      cellElement.id = cellId;
      cellElement.classList.add(styles.blank);
    }

    return cellElement;
  }

  public drawCell(cell: ICell): HTMLElement {
    const cellId = this.getCellId(cell.position);
    let cellElement = document.getElementById(cellId);

    if (!cellElement) {
      cellElement = document.createElement('div');
      cellElement.id = cellId;
      cellElement.classList.add(styles.cell);
    }

    return cellElement;
  }

  public addNavigation(interactive: NavigationInteractive): void {
    const keydownListener = createKeyListener({
      ArrowUp: () => interactive[Direction.TOP]?.(),
      ArrowRight: () => interactive[Direction.RIGHT]?.(),
      ArrowDown: () => interactive[Direction.BOTTOM]?.(),
      ArrowLeft: () => interactive[Direction.LEFT]?.(),
    });

    document.addEventListener('keydown', keydownListener);

    this.deregisterNavigation = () =>
      document.removeEventListener('keydown', keydownListener);
  }

  public destroy(): void {
    this.mazeElement?.remove();
    this.deregisterNavigation?.();
  }

  private drawAndPositionCell(
    cellOrPosition: ICell | Position,
    offset: [number, number]
  ): HTMLElement {
    let cellElement: HTMLElement;

    if ('position' in cellOrPosition) {
      cellElement = this.drawCell(cellOrPosition);
    } else {
      cellElement = this.drawBlank(cellOrPosition);
    }

    const [x, y] = offset;

    cellElement.style.gridArea = `${y + 1} / ${x + 1}`;

    return cellElement;
  }

  private getCellId(position: Position): string {
    const [x, y] = position;
    return `cell-${y}-${x}`;
  }
}
