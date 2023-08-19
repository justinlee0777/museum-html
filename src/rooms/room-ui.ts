import styles from './room-ui.module.css';

import ICell from '../models/cell.interface';
import RoomData from './room-data';

export default class RoomUI {
  private mazeElement: HTMLElement;

  public draw(data: RoomData): HTMLElement {
    const cells = [...data.getCells()];

    const hasPlayer = styles['has-player'];

    if (this.mazeElement) {
      this.mazeElement.querySelectorAll('.cell').forEach((cellElement, i) => {
        const cell = cells[i];
        if (cell.hasPlayer) {
          cellElement.classList.add(hasPlayer);
        } else {
          cellElement.classList.remove(hasPlayer);
        }
      });
    } else {
      const mazeElement = (this.mazeElement = document.createElement('div'));
      mazeElement.className = styles.maze;

      for (const cell of cells) {
        mazeElement.appendChild(this.drawCell(cell));
      }

      return mazeElement;
    }
  }

  private drawCell(cell: ICell): HTMLElement {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');

    if (cell.hasPlayer) {
      cellElement.classList.add(styles['has-player']);
    }

    return cellElement;
  }
}
