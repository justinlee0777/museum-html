import styles from './museum.module.css';

import Cell from './models/cell.model';
import Position from './models/position.model';
import MuseumArgs from './models/museum-args.model';
import PlayerSprite, {
  SpritePosture as PlayerSpritePosture,
} from './sprites/player';
import ANIMATION_RATE from './consts/animate-rate.const';
import {
  MuseumObject,
  MuseumObjectInteraction,
} from './models/museum-object.model';
import TileLayer from './layers/tile.layer';
import ObjectLayer from './layers/object.layer';
import WallLayer from './layers/wall.layer';

export default class Museum {
  private cells: Array<Array<Cell>>;

  private wallPositions: Set<string>;

  private playerPosition: Position;

  private playerSprite: PlayerSprite;

  private museumElement: HTMLElement | undefined;

  private interactionFrame: HTMLElement | undefined;

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
    const { cellSize, objects, walls, registries } = this.args;

    const height = cells.length * cellSize;
    const width = cells[0].length * cellSize;

    const mazeElement = (this.museumElement = document.createElement('div'));
    mazeElement.className = styles.museum;

    const museumFrame = document.createElement('div');
    museumFrame.className = styles.museumFrame;
    museumFrame.style.height = `${height}px`;
    museumFrame.style.width = `${width}px`;

    const tileLayer = new TileLayer(
      registries.tile,
      { cellSize, height, width },
      cells
    );

    tileLayer.draw();

    const tileLayerSprite = tileLayer.sprite!;
    tileLayerSprite.classList.add(styles.layer);

    museumFrame.appendChild(tileLayerSprite);

    const wallLayer = new WallLayer(
      registries.wall,
      { cellSize, height, width },
      cells,
      walls
    );

    wallLayer.draw();

    const wallLayerSprite = wallLayer.sprite!;
    wallLayerSprite.classList.add(styles.layer);

    museumFrame.appendChild(wallLayerSprite);

    const objectLayer = new ObjectLayer(
      registries.object,
      { cellSize, height, width },
      objects
    );

    objectLayer.draw();

    const objectLayerSprite = objectLayer.sprite!;
    objectLayerSprite.classList.add(styles.layer);

    museumFrame.appendChild(objectLayerSprite);

    museumFrame.appendChild(this.playerSprite.sprite!);

    mazeElement.appendChild(museumFrame);

    /*
    const interactionFrame = (this.interactionFrame =
      document.createElement('div'));

    interactionFrame.className = styles.interactionFrame;
    interactionFrame.style.height = `${height}px`;
    interactionFrame.style.width = `${width}px`;

    mazeElement.appendChild(interactionFrame);
    */

    this.drawPlayer();

    return mazeElement;
  }

  addKeyListeners(): void {
    const pressedKeys: Set<String> = new Set();
    const keyPrecedence = [
      'Escape',
      'A',
      'a',
      'ArrowUp',
      'ArrowRight',
      'ArrowDown',
      'ArrowLeft',
    ];

    let updatePlayerLock = false;

    const updatePlayer = async () => {
      if (updatePlayerLock) {
        return;
      }

      for (const key of keyPrecedence) {
        if (pressedKeys.has(key)) {
          updatePlayerLock = true;

          try {
            switch (key) {
              case 'ArrowUp':
              case 'ArrowRight':
              case 'ArrowDown':
              case 'ArrowLeft':
                await this.movePlayer(key);
                break;
              case 'A':
              case 'a':
                this.openObjectDescription();
                break;
              case 'Escape':
                if (this.interactionFrame) {
                  this.interactionFrame.remove();
                  this.interactionFrame = undefined;
                }
                break;
              default:
                return;
            }
          } catch (error) {
            console.log('error updating player', error);
          } finally {
            updatePlayerLock = false;
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
    object: MuseumObject
  ): boolean {
    let originX: number,
      originY: number,
      width = 1,
      height = 1;

    if ('origin' in object) {
      [originX, originY] = object.origin;
      ({ height, width } = object);
    } else {
      [originX, originY] = object.position;
    }

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

  private async movePlayer(
    key: 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
  ) {
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
    }

    if (!this.canUpdatePlayer(newPosition)) {
      newPosition = this.playerPosition;
    }

    const [newTop, newLeft] = this.getTopLeftValues(newPosition);
    await Promise.all([
      animation(),
      this.playerSprite
        .sprite!.animate([{ top: newTop, left: newLeft }], ANIMATION_RATE)
        .finished.then(() => {
          this.updatePlayer(newPosition);

          this.drawPlayer();
        }),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1000 / 60));
  }

  private openObjectDescription(): void {
    const {
      playerPosition: [px, py],
      playerSprite,
      args: { height, width, objects },
    } = this;

    let newY = py,
      newX = px;

    switch (playerSprite.getDirection()) {
      case 'Up':
        newY = py - 1;
        if (newY < 0) {
          return;
        }
        break;
      case 'Right':
        newX = px + 1;
        if (newX >= width) {
          return;
        }
        break;
      case 'Down':
        newY = py + 1;
        if (newY >= height) {
          return;
        }
        break;
      case 'Left':
        newX = px - 1;
        if (newX < 0) {
          return;
        }
        break;
    }

    const interactions = objects.reduce(
      (
        acc: Array<MuseumObjectInteraction & { object: MuseumObject }>,
        object
      ) =>
        acc.concat(
          (object.interactions ?? []).map((interaction) => ({
            ...interaction,
            object,
          }))
        ),
      []
    );

    for (const interaction of interactions) {
      let minX: number, minY: number, maxX: number, maxY: number;

      let ox: number,
        oy: number,
        height = 1,
        width = 1;

      if ('origin' in interaction) {
        [ox, oy] = interaction.origin;
        ({ height, width } = interaction);
      } else if ('position' in interaction) {
        [ox, oy] = interaction.position;
      } else {
        const { object } = interaction;

        if ('origin' in object) {
          [ox, oy] = object.origin;
          ({ height, width } = object);
        } else {
          [ox, oy] = object.position;
        }
      }

      minX = ox;
      minY = oy;
      maxX = ox + width;
      maxY = ox + height;

      // going to assume objects / interactions do not overlap.
      if (minX <= newX && maxX >= newX && minY <= newY && maxY >= newY) {
        const museumElement = this.museumElement!;

        if (this.interactionFrame) {
          this.interactionFrame.remove();
        }

        const interactionFrame = (this.interactionFrame =
          document.createElement('div'));
        interactionFrame.className = styles.interactionFrame;

        if ('description' in interaction) {
          const objectDescription = document.createElement('div');
          objectDescription.textContent = interaction.description;
          objectDescription.className = styles.objectDescription;

          interactionFrame.appendChild(objectDescription);
        } else {
          const image = document.createElement('img');
          image.src = interaction.url;

          interactionFrame.appendChild(image);
        }

        museumElement.appendChild(interactionFrame);

        return;
      }
    }
  }

  private getWallKey([y, x]: Position): string {
    return `${y}-${x}`;
  }
}
