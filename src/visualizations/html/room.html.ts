import styles from './room.html.module.css';

import { createKeyListener } from '@justinlee0777/components/utils/create-key-listener';

import ICell from '../../models/cell.interface';
import RoomData from '../../data/room.data';
import Position from '../../models/position.interface';
import Camera from '../../models/camera.interface';
import RoomVisualization from '../models/room-visualization.model';
import NavigationInteractive from '../../interactive/navigation.interactive';
import Direction from '../../models/direction.enum';

export default class HTMLRoom implements RoomVisualization<HTMLElement> {
  private camera: Camera;

  private mazeElement: HTMLElement | undefined;

  constructor() {
    const cameraSize = Number(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--camera-size'
      )
    );

    this.camera = [cameraSize, cameraSize];
  }

  public draw(data: RoomData, origin: Position): HTMLElement {
    if (!this.mazeElement) {
      const mazeElement = (this.mazeElement = document.createElement('div'));
      mazeElement.className = styles.maze;
    }

    const { mazeElement } = this;

    const cells = data.getCells(origin, this.camera, ['center', 'center']);

    const drawnCells = new Set<string>();

    cells.forEach((row, j) => {
      row.forEach((cell, i) => {
        if (cell) {
          const cellElement = this.drawAndPositionCell(cell, [i, j]);

          drawnCells.add(this.getCellId(cell));

          if (!cellElement.parentElement) {
            mazeElement.appendChild(cellElement);
          }
        }
      });
    });

    Array.from(document.querySelectorAll('[id^="cell"]'))
      .filter((element) => !drawnCells.has(element.id))
      .forEach((element) => element.remove());

    return mazeElement;
  }

  public drawBlank(): void {}

  public drawCell(cell: ICell): HTMLElement {
    let cellElement = document.getElementById(this.getCellId(cell));

    if (!cellElement) {
      cellElement = document.createElement('div');
      cellElement.id = this.getCellId(cell);
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
    // TODO: Destroy?
    document.addEventListener('keydown', keydownListener);
  }

  private drawAndPositionCell(
    cell: ICell,
    offset: [number, number]
  ): HTMLElement {
    const cellElement = this.drawCell(cell);

    const [x, y] = offset;

    cellElement.style.gridArea = `${y + 1} / ${x + 1}`;

    return cellElement;
  }

  private getCellId(cell: ICell): string {
    const [x, y] = cell.position;
    return `cell-${y}-${x}`;
  }
}
