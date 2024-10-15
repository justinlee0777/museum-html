import styles from './museum.module.css';

import Cell from './models/cell.model';
import Position from './models/position.model';
import MuseumArgs from './models/museum-args.model';
import TileSprite from './sprites/tile';
import PlayerSprite, {
  SpritePosture as PlayerSpritePosture,
} from './sprites/player';
import ANIMATION_RATE from './consts/animate-rate.const';

export default class Museum {
  private cells: Array<Array<Cell>>;

  private playerPosition: Position;

  private playerSpriteElement: HTMLElement;

  private playerSprite: PlayerSprite;

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

    const playerSpriteElement = (this.playerSpriteElement =
      document.createElement('div'));
    playerSpriteElement.className = styles.spriteHolder;

    const playerSprite = (this.playerSprite = new PlayerSprite({
      cellSize,
    }));

    playerSprite.draw(PlayerSpritePosture.DOWN_STANDING);

    playerSpriteElement.appendChild(playerSprite.sprite!);
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

    mazeElement.appendChild(this.playerSpriteElement);

    this.drawPlayer();

    return mazeElement;
  }

  addKeyListeners(): void {
    const pressedKeys: Set<String> = new Set();
    const keyPrecedence = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

    let updatePlayerLock = false;

    const updatePlayer = async () => {
      if (updatePlayerLock) {
        return;
      }

      for (const key of keyPrecedence) {
        if (pressedKeys.has(key)) {
          const { playerPosition } = this;
          const [y, x] = playerPosition;

          let animation: () => Promise<void>, newPosition: Position;

          switch (key) {
            case 'ArrowUp':
              animation = () => this.playerSprite.drawWalkingUp();
              newPosition = [y - 1, x];
              break;
            case 'ArrowRight':
              animation = () => this.playerSprite.drawWalkingRight();
              newPosition = [y, x + 1];
              break;
            case 'ArrowDown':
              animation = () => this.playerSprite.drawWalkingDown();
              newPosition = [y + 1, x];
              break;
            case 'ArrowLeft':
              animation = () => this.playerSprite.drawWalkingLeft();
              newPosition = [y, x - 1];
              break;
            default:
              return;
          }

          if (this.canUpdatePlayer(newPosition)) {
            updatePlayerLock = true;

            try {
              const [newTop, newLeft] = this.getTopLeftValues(newPosition);
              await Promise.all([
                animation(),
                this.playerSpriteElement.animate(
                  [{ top: newTop, left: newLeft }],
                  ANIMATION_RATE
                ),
              ]);

              this.updatePlayer(newPosition);

              this.drawPlayer();

              await new Promise((resolve) => setTimeout(resolve, 1000 / 60));
            } catch (error) {
              console.log('error updating player', error);
            } finally {
              updatePlayerLock = false;
            }
            return;
          }
        }
      }
    };

    document.body.addEventListener('keydown', (event) => {
      pressedKeys.add(event.key);
      updatePlayer();
    });

    document.addEventListener('keyup', (event) => {
      pressedKeys.delete(event.key);
      updatePlayer();
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

    const tileSprite = new TileSprite({ cellSize: this.args.cellSize });
    tileSprite.draw();

    cellHolder.appendChild(tileSprite.sprite!);

    cellElement.appendChild(cellHolder);

    return cellElement;
  }

  private getCellId(position: Position): string {
    const [x, y] = position;
    return `cell-${y}-${x}`;
  }

  private canUpdatePlayer(newPosition: Position): boolean {
    const { height, width } = this.args;

    return (
      newPosition.every((pos) => pos >= 0) &&
      newPosition[0] < height &&
      newPosition[1] < width
    );
  }

  private updatePlayer(newPosition: Position) {
    const { playerPosition } = this;

    if (!this.canUpdatePlayer(newPosition)) {
      return;
    }

    this.cells[playerPosition[0]][playerPosition[1]].data = undefined;

    this.playerPosition = newPosition;

    this.cells[playerPosition[0]][playerPosition[1]].data = {
      hasPlayer: true,
    };
  }

  private getTopLeftValues(position: Position): [string, string] {
    const { cellSize } = this.args;
    const [y, x] = position;

    return [`${cellSize * y}px`, `${cellSize * x}px`];
  }

  private drawPlayer() {
    const [top, left] = this.getTopLeftValues(this.playerPosition);

    this.playerSpriteElement.style.top = top;
    this.playerSpriteElement.style.left = left;
  }
}
