import styles from './room-ui.module.css';

import ICell from '../models/cell.interface';
import RoomData from './room-data';

export default class RoomUI {
  public draw(data: RoomData): HTMLElement {
    const cellSize = this.getCellSize();

    const mazeElement = document.createElement('div');
    mazeElement.className = styles.maze;

    const startingCell = data.start();

    const queue: Array<{
      cell: ICell;
      offset: [number, number];
    }> = [
      {
        cell: startingCell,
        offset: [0, 0],
      },
    ];
    const visitedCells = new Set();

    while (queue.length > 0) {
      const { cell, offset } = queue.pop();

      if (!visitedCells.has(cell.id)) {
        const cellElement = this.drawCell(cell, cellSize, offset);

        mazeElement.appendChild(cellElement);

        visitedCells.add(cell.id);

        const [x, y] = offset;

        const cells = [
          { cell: cell.top, offset: [x, y - cellSize] as [number, number] },
          { cell: cell.right, offset: [x + cellSize, y] as [number, number] },
          { cell: cell.bottom, offset: [x, y + cellSize] as [number, number] },
          { cell: cell.left, offset: [x - cellSize, y] as [number, number] },
        ].filter((c) => c.cell);

        queue.push(...cells);
      }
    }

    return mazeElement;
  }

  public drawCell(
    cell: ICell,
    cellSize: number,
    offset?: [number, number]
  ): HTMLElement {
    let cellElement = document.getElementById(this.getCellId(cell));

    if (!cellElement) {
      cellElement = document.createElement('div');
      cellElement.id = this.getCellId(cell);
      cellElement.classList.add(styles.cell);

      const [x, y] = offset ?? [0, 0];

      cellElement.style.top = `calc(50% - ${cellSize}px + ${y}px)`;
      cellElement.style.left = `calc(50% - ${cellSize}px + ${x}px)`;
    }

    return cellElement;
  }

  public redraw(affectedCells: Array<ICell>): void {
    for (const cell of affectedCells) {
      const cellId = this.getCellId(cell);
      const element = document.getElementById(cellId);

      if (element) {
        this.drawCell(cell, this.getCellSize(), undefined);
      } else {
        throw new Error('');
      }
    }
  }

  private getCellSize(): number {
    return Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--cell-size')
        .replace(/\D+/, '')
    );
  }

  private getCellId(cell: ICell): string {
    return `cell-${cell.id}`;
  }
}
