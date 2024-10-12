import styles from './museum.module.css';

import Cell from './models/cell.model';
import Position from './models/position.model';
import MuseumArgs from './models/museum-args.model';
import drawPlayerSprite, {
  SpritePosture as PlayerSpritePosture,
} from './sprites/player';
import drawTileSprite from './sprites/tile';

export default class Museum {
  private cells: Array<Array<Cell>>;

  private playerPosition: Position;

  private playerSprite: HTMLElement;

  private museumElement: HTMLElement | undefined;

  constructor(public args: MuseumArgs) {
    const { height, width, cellSize, playerPosition } = args;

    this.cells = Array(height)
      .fill(undefined)
      .map((_, j) =>
        Array(width)
          .fill(undefined)
          .map((_, i) => ({
            position: [i, j],
          }))
      );

    this.playerPosition = playerPosition;

    const playerSprite = (this.playerSprite = document.createElement('div'));
    playerSprite.className = styles.spriteHolder;

    playerSprite.appendChild(
      drawPlayerSprite({
        cellSize,
        posture: PlayerSpritePosture.DOWN_STANDING,
      })
    );
  }

  draw(): HTMLElement {
    const { height, width, cellSize } = this.args;

    const mazeElement = (this.museumElement = document.createElement('div'));
    mazeElement.className = styles.maze;
    mazeElement.style.gridTemplate = `repeat(${height}, ${cellSize}px) / repeat(${width}, ${cellSize}px)`;

    this.cells.forEach((row, j) => {
      row.forEach((_, i) => {
        const cellElement = this.drawCell([i, j]);

        mazeElement.appendChild(cellElement);
      });
    });

    this.drawPlayer();

    return mazeElement;
  }

  addKeyListeners(): void {
    document.body.addEventListener('keyup', (event) => {
      const { playerPosition } = this;

      this.removePlayer();

      switch (event.key) {
        case 'ArrowUp':
          this.updatePlayer([playerPosition[0] - 1, playerPosition[1]]);
          break;
        case 'ArrowRight':
          this.updatePlayer([playerPosition[0], playerPosition[1] + 1]);
          break;
        case 'ArrowDown':
          this.updatePlayer([playerPosition[0] + 1, playerPosition[1]]);
          break;
        case 'ArrowLeft':
          this.updatePlayer([playerPosition[0], playerPosition[1] - 1]);
          break;
      }

      this.drawPlayer();
    });
  }

  private drawCell([i, j]: Position): HTMLElement {
    const cellId = this.getCellId([j, i]);

    const cellElement = document.createElement('div');
    cellElement.className = styles.cell;
    cellElement.id = cellId;
    cellElement.style.gridArea = `${j + 1} / ${i + 1}`;

    const cellHolder = document.createElement('div');
    cellHolder.className = styles.spriteHolder;

    const tileSprite = drawTileSprite({ cellSize: this.args.cellSize });

    cellHolder.appendChild(tileSprite);

    cellElement.appendChild(cellHolder);

    return cellElement;
  }

  private getCellId(position: Position): string {
    const [x, y] = position;
    return `cell-${y}-${x}`;
  }

  private updatePlayer(newPosition: Position) {
    const { playerPosition } = this;
    const { height, width } = this.args;

    if (
      !newPosition.every((pos) => pos >= 0) ||
      newPosition[0] >= height ||
      newPosition[1] >= width
    ) {
      return;
    }

    this.cells[playerPosition[0]][playerPosition[1]].data = undefined;

    this.playerPosition = newPosition;

    this.cells[playerPosition[0]][playerPosition[1]].data = {
      hasPlayer: true,
    };
  }

  private removePlayer() {
    const { museumElement } = this;

    if (!museumElement) {
      return;
    }

    this.playerSprite.remove();
  }

  private drawPlayer() {
    const { museumElement } = this;

    if (!museumElement) {
      return;
    }

    const cellId = this.getCellId(this.playerPosition);

    const cellElement = museumElement.querySelector(`#${cellId}`)!;

    cellElement.appendChild(this.playerSprite);
  }
}
