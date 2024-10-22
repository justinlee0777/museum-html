import styles from './museum.module.css';

import Cell from './models/cell.model';
import Position from './models/position.model';
import MuseumArgs from './models/museum-args.model';
import PlayerSprite, {
  SpritePosture as PlayerSpritePosture,
} from './sprites/player';
import ANIMATION_RATE from './consts/animate-rate.const';
import MuseumObject from './models/museum-object.model';
import TileLayer from './layers/tile.layer';
import ObjectLayer from './layers/object.layer';
import WallLayer from './layers/wall.layer';

export default class Museum {
  private cells: Array<Array<Cell>>;

  private wallPositions: Set<string>;

  private playerPosition: Position;

  private playerSprite: PlayerSprite;

  private museumElement: HTMLElement | undefined;

  constructor(public args: MuseumArgs) {
    const { height, width, cellSize, playerPosition, objects, walls } = args;

    this.cells = Array(height)
      .fill(undefined)
      .map((_, j) =>
        Array(width)
          .fill(undefined)
          .map((_, i) => {
            const position = [i, j] as Position;
            const object = objects.find((object) =>
              this.isObjectInCell(position, object)
            );

            const cell: Cell = {
              position: [i, j],
              data: {
                object,
              },
            };

            return cell;
          })
      );

    const wallPositions = (this.wallPositions = new Set());
    for (const wall of walls) {
      const {
        origin: [ox, oy],
      } = wall;
      let range: Array<Position>;
      if ('height' in wall) {
        range = Array(wall.height)
          .fill(undefined)
          .map((_, i) => [ox, oy + i]);
      } else {
        range = Array(wall.width)
          .fill(undefined)
          .map((_, i) => [ox + i, oy]);
      }

      for (const position of range) {
        wallPositions.add(this.getWallKey(position));
      }
    }

    this.playerPosition = playerPosition;

    const playerSprite = (this.playerSprite = new PlayerSprite({
      cellSize,
    }));

    playerSprite.draw(PlayerSpritePosture.DOWN_STANDING);

    playerSprite.sprite!.className = styles.player;
  }

  draw(): HTMLElement {
    const { cells } = this;
    const { height, width, cellSize, objects, walls, registries } = this.args;

    const mazeElement = (this.museumElement = document.createElement('div'));
    mazeElement.className = styles.maze;
    mazeElement.style.gridTemplate = `repeat(${height}, ${cellSize}px) / repeat(${width}, ${cellSize}px)`;

    const tileLayer = new TileLayer(registries.tile, { cellSize }, cells);

    tileLayer.draw();

    const tileLayerSprite = tileLayer.sprite!;
    tileLayerSprite.classList.add(styles.layer);

    mazeElement.appendChild(tileLayerSprite);

    const wallLayer = new WallLayer(
      registries.wall,
      { cellSize },
      cells,
      walls
    );

    wallLayer.draw();

    const wallLayerSprite = wallLayer.sprite!;
    wallLayerSprite.classList.add(styles.layer);

    mazeElement.appendChild(wallLayerSprite);

    const objectLayer = new ObjectLayer(
      registries.object,
      { cellSize },
      cells,
      objects
    );

    objectLayer.draw();

    const objectLayerSprite = objectLayer.sprite!;
    objectLayerSprite.classList.add(styles.layer);

    mazeElement.appendChild(objectLayerSprite);

    mazeElement.appendChild(this.playerSprite.sprite!);

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
          const [x, y] = playerPosition;

          let animation: () => Promise<void>, newPosition: Position;

          switch (key) {
            case 'ArrowUp':
              animation = () => this.playerSprite.drawWalkingUp();
              newPosition = [x, y - 1];
              break;
            case 'ArrowRight':
              animation = () => this.playerSprite.drawWalkingRight();
              newPosition = [x + 1, y];
              break;
            case 'ArrowDown':
              animation = () => this.playerSprite.drawWalkingDown();
              newPosition = [x, y + 1];
              break;
            case 'ArrowLeft':
              animation = () => this.playerSprite.drawWalkingLeft();
              newPosition = [x - 1, y];
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
                this.playerSprite
                  .sprite!.animate(
                    [{ top: newTop, left: newLeft }],
                    ANIMATION_RATE
                  )
                  .finished.then(() => {
                    this.updatePlayer(newPosition);

                    this.drawPlayer();
                  }),
              ]);

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

  private isObjectInCell(
    [cellX, cellY]: Position,
    { origin: [originX, originY], width, height }: MuseumObject
  ): boolean {
    return (
      cellY >= originY &&
      cellY < originY + height &&
      cellX >= originX &&
      cellX < originX + width
    );
  }

  private canUpdatePlayer(newPosition: Position): boolean {
    const { height, width } = this.args;

    return (
      newPosition.every((pos) => pos >= 0) &&
      newPosition[0] < width &&
      newPosition[1] < height &&
      !this.wallPositions.has(this.getWallKey(newPosition))
    );
  }

  private updatePlayer(newPosition: Position) {
    const { playerPosition } = this;

    if (!this.canUpdatePlayer(newPosition)) {
      return;
    }

    delete this.cells[playerPosition[1]][playerPosition[0]].data?.hasPlayer;

    this.playerPosition = newPosition;

    this.cells[playerPosition[1]][playerPosition[0]].data = {
      ...this.cells[playerPosition[1]][playerPosition[0]].data,
      hasPlayer: true,
    };
  }

  private getTopLeftValues(position: Position): [string, string] {
    const { cellSize } = this.args;
    const [x, y] = position;

    return [`${cellSize * y}px`, `${cellSize * x}px`];
  }

  private drawPlayer() {
    const [top, left] = this.getTopLeftValues(this.playerPosition);

    this.playerSprite.sprite!.style.top = top;
    this.playerSprite.sprite!.style.left = left;
  }

  private getWallKey([y, x]: Position): string {
    return `${y}-${x}`;
  }
}
