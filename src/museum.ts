import styles from './museum.module.css';

import Cell from './models/cell.model';
import { Position, ProposedPosition } from './models/position.model';
import MuseumArgs from './models/museum-args.model';
import ANIMATION_RATE from './consts/animate-rate.const';
import {
  MuseumObject,
  MuseumObjectInteraction,
} from './models/museum-object.model';
import TileLayer from './layers/tile.layer';
import ObjectLayer from './layers/object.layer';
import WallLayer from './layers/wall.layer';
import Painting from './painting';
import ObjectDescription from './object-description';
import { PlayerSprite } from './models/player-sprite.model';
import DestinationLayer from './layers/destination.layer';
import { toPositions } from './utils/to-positions.function';

export default class Museum {
  private cells: Array<Array<Cell>>;

  private wallPositions: Set<string>;

  private playerPosition: Position;

  private playerSprite: PlayerSprite;

  private initialized:
    | {
        museumElement: HTMLElement;
        width: number;
        height: number;
        destinationLayer: DestinationLayer;
      }
    | undefined;

  private interactionContext:
    | {
        interactionFrame: HTMLElement;
        painting?: Painting;
      }
    | undefined;

  private destinationPosition: Position | undefined;

  private walkingLock: Symbol | undefined;

  constructor(public args: MuseumArgs) {
    const {
      height,
      width,
      cellSize,
      playerPosition,
      objects,
      walls,
      registries: { player },
    } = args;

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

    const playerSprite = (this.playerSprite = player);

    playerSprite.draw({ cellSize });

    playerSprite.sprite!.className = styles.player;
  }

  draw(): HTMLElement {
    const { cells } = this;
    const { cellSize, objects, walls, registries } = this.args;

    const height = cells.length * cellSize;
    const width = cells[0].length * cellSize;

    const museumElement = document.createElement('div');
    museumElement.tabIndex = 0;
    museumElement.className = styles.museum;

    const canvasElement = document.createElement('canvas');
    canvasElement.height = height;
    canvasElement.width = width;

    const tileLayer = new TileLayer(registries.tile, { cellSize }, cells);

    tileLayer.draw(canvasElement);

    const wallLayer = new WallLayer(
      registries.wall,
      { cellSize },
      cells,
      walls
    );

    wallLayer.draw(canvasElement);

    const objectLayer = new ObjectLayer(
      registries.object,
      { cellSize },
      objects
    );

    objectLayer.draw(canvasElement);

    const destinationLayer = new DestinationLayer({
      cellSize,
      height,
      width,
      cells,
      walls,
    });

    destinationLayer.draw();

    museumElement.append(canvasElement, destinationLayer.element!);

    museumElement.appendChild(this.playerSprite.sprite!);

    this.initialized = {
      museumElement,
      width,
      height,
      destinationLayer,
    };

    this.drawPlayer();

    return museumElement;
  }

  /*
   * TODO Wondering if there's any wisdom in ripping out the event system directly from the museum itself
   * and abstracting these actions.
   */
  addKeyListeners(): void {
    const pressedKeys: Set<String> = new Set();
    const keyPrecedence = [
      'Escape',
      'A',
      'a',
      'Enter',
      '-',
      '=',
      '_',
      '+',
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
              case 'Escape':
                if (this.interactionContext) {
                  this.interactionContext.interactionFrame.remove();
                  this.interactionContext = undefined;
                  this.initialized!.museumElement.focus();
                }
                break;
              case 'A':
              case 'a':
                this.openObjectDescription();
                break;
              case 'Enter':
                this.openHelpMenu();
                break;
              case '-':
              case '_':
                if (this.interactionContext) {
                  this.interactionContext.painting?.zoomOut();
                }
                break;
              case '=':
              case '+':
                if (this.interactionContext) {
                  this.interactionContext.painting?.zoomIn();
                }
                break;
              case 'ArrowUp':
              case 'ArrowRight':
              case 'ArrowDown':
              case 'ArrowLeft':
                if (!this.interactionContext) {
                  await this.movePlayer(key);
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

    const { museumElement } = this.initialized!;

    museumElement.addEventListener('keydown', (event) => {
      pressedKeys.add(event.key);
      updatePlayer();
    });

    museumElement.addEventListener('keyup', (event) => {
      pressedKeys.delete(event.key);
      updatePlayer();
    });

    museumElement.addEventListener('click', async (event) => {
      this.initialized?.museumElement.focus();

      const { cellSize } = this.args;

      const destinationPosition = (this.destinationPosition = [
        Math.floor(event.x / cellSize),
        Math.floor(event.y / cellSize),
      ]);

      const { destinationLayer } = this.initialized!;

      const path = this.calculatePath(this.playerPosition, destinationPosition);

      // Interactions are allowed by clicks if only the last position is invalid.
      const allowInteraction = path.length < 2 ? true : path.at(-2)?.valid;

      updatePlayerLock = true;
      const walkingLock = (this.walkingLock = Symbol(
        `This indicates the current click listener has the right to continue its own walking animation.`
      ));

      // Whether the current function invocation has lost the right to continue its walking animation.
      let isLockedOut = false;

      try {
        while (path.length > 0) {
          if (walkingLock !== this.walkingLock) {
            isLockedOut = true;
            return;
          }

          destinationLayer.draw({
            path,
          });

          let key: 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft';

          const {
            position: [newX, newY],
            valid,
          } = path.shift()!;

          if (!valid) {
            break;
          }

          const [playerX, playerY] = this.playerPosition;

          if (newY < playerY) {
            key = 'ArrowUp';
          } else if (newX > playerX) {
            key = 'ArrowRight';
          } else if (newY > playerY) {
            key = 'ArrowDown';
          } else if (newX < playerX) {
            key = 'ArrowLeft';
          } else {
            throw new Error('There should be a change in this iteration.');
          }

          await this.movePlayer(key);
        }
      } finally {
        if (!isLockedOut) {
          updatePlayerLock = false;
          destinationLayer.clear();

          if (allowInteraction) {
            this.openObjectDescription(destinationPosition);
          }
        }
      }
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

  private getCameraOrigin(): Position {
    const {
      playerPosition: [x, y],
      args: { cellSize },
    } = this;

    const { museumElement } = this.initialized!;

    const playerX = x * cellSize;
    const playerY = y * cellSize;

    const diffX = museumElement.clientWidth / 2;
    const diffY = museumElement.clientHeight / 2;

    return [Math.max(0, playerX - diffX), Math.max(0, playerY - diffY)];
  }

  private drawPlayer() {
    const { playerPosition } = this;

    const [top, left] = this.getTopLeftValues(playerPosition);

    this.playerSprite.sprite!.style.top = top;
    this.playerSprite.sprite!.style.left = left;

    const { museumElement } = this.initialized!;

    const [scrollLeft, scrollTop] = this.getCameraOrigin();

    museumElement.scroll({
      top: scrollTop,
      left: scrollLeft,
      behavior: 'smooth',
    });
  }

  private async movePlayer(
    key: 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
  ) {
    const { playerPosition } = this;
    const { cellSize } = this.args;
    const [x, y] = playerPosition;

    let newPosition: Position, direction: 'up' | 'right' | 'down' | 'left';

    switch (key) {
      case 'ArrowUp':
        direction = 'up';
        newPosition = [x, y - 1];
        break;
      case 'ArrowRight':
        direction = 'right';
        newPosition = [x + 1, y];
        break;
      case 'ArrowDown':
        direction = 'down';
        newPosition = [x, y + 1];
        break;
      case 'ArrowLeft':
        direction = 'left';
        newPosition = [x - 1, y];
        break;
    }

    const animation = () =>
      this.playerSprite.draw(
        { cellSize },
        {
          direction,
          animationTime: ANIMATION_RATE,
          type: 'walk',
        }
      );

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

  private createInteractionFrame(): HTMLElement {
    const { museumElement } = this.initialized!;

    const interactionFrame = document.createElement('div');
    interactionFrame.className = styles.interactionFrame;
    interactionFrame.style.bottom = `0px`;
    interactionFrame.style.left = `${museumElement.scrollLeft}px`;
    interactionFrame.tabIndex = 0;

    return interactionFrame;
  }

  /**
   * TODO: this should probably look at the object in the cell rather than every object. That being said, I imagine
   * performance loss is negligible ATM.
   */
  private openObjectDescription(destination?: Position): void {
    const {
      playerPosition: [px, py],
      playerSprite,
      args: { height, width, objects },
    } = this;

    let newY: number, newX: number;

    if (destination) {
      [newX, newY] = destination;
    } else {
      (newY = py), (newX = px);

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
      maxY = oy + height;

      // going to assume objects / interactions do not overlap.
      if (minX <= newX && maxX > newX && minY <= newY && maxY > newY) {
        const { museumElement } = this.initialized!;

        if (this.interactionContext) {
          this.interactionContext.interactionFrame.remove();
          this.interactionContext = undefined;
        }

        const interactionFrame = this.createInteractionFrame();

        let painting: Painting | undefined;

        if ('description' in interaction) {
          const objectDescription = new ObjectDescription(interaction);

          objectDescription.draw();

          interactionFrame.appendChild(objectDescription.element!);
        } else {
          painting = new Painting(
            museumElement.clientHeight,
            museumElement.clientWidth,
            interaction.url
          );

          painting.draw();

          interactionFrame.appendChild(painting.element!);
        }

        museumElement.appendChild(interactionFrame);

        interactionFrame.focus();

        this.interactionContext = {
          interactionFrame,
          painting,
        };

        return;
      }
    }
  }

  private openHelpMenu(): void {
    if (this.interactionContext) {
      this.interactionContext.interactionFrame.remove();
      this.interactionContext = undefined;
    }

    const interactionFrame = this.createInteractionFrame();

    interface Action {
      key: string;
      description: string;
    }

    const generalActions: Array<Action> = [
      {
        key: '\u21E6',
        description: 'Left',
      },
      {
        key: '\u21E7',
        description: 'Up',
      },
      {
        key: '\u21E8',
        description: 'Right',
      },
      {
        key: '\u21E9',
        description: 'Down',
      },
      {
        key: 'Enter',
        description: 'Help',
      },
    ];

    const museumActions: Array<Action> = [
      {
        key: 'A',
        description: 'Interact',
      },
    ];

    const menuActions: Array<Action> = [
      {
        key: 'Escape',
        description: 'Close',
      },
      {
        key: '+',
        description: 'Zoom in',
      },
      {
        key: '-',
        description: 'Zoom out',
      },
    ];

    const helpMenu = document.createElement('div');
    helpMenu.classList.add(styles.helpMenu);

    const generalActionsHeader = document.createElement('h3');
    generalActionsHeader.classList.add(styles.helpMenuHeader);
    generalActionsHeader.textContent = 'General';

    const museumActionsHeader = document.createElement('h3');
    museumActionsHeader.classList.add(styles.helpMenuHeader);
    museumActionsHeader.textContent = 'Museum';

    const menuActionsHeader = document.createElement('h3');
    menuActionsHeader.classList.add(styles.helpMenuHeader);
    menuActionsHeader.textContent = 'Menu';

    function createActionElement({ key, description }: Action): HTMLElement {
      const actionElement = document.createElement('span');

      const keyElement = document.createElement('span');
      keyElement.classList.add(styles.helpMenuKey);
      keyElement.textContent = key;

      actionElement.innerHTML = `${keyElement.outerHTML} ${description}`;

      return actionElement;
    }

    helpMenu.append(
      generalActionsHeader,
      ...generalActions.map(createActionElement),
      museumActionsHeader,
      ...museumActions.map(createActionElement),
      menuActionsHeader,
      ...menuActions.map(createActionElement)
    );

    interactionFrame.appendChild(helpMenu);

    const { museumElement } = this.initialized!;

    museumElement.appendChild(interactionFrame);

    this.interactionContext = {
      interactionFrame,
    };
  }

  private calculatePath(
    [fromX, fromY]: Position,
    [toX, toY]: Position
  ): Array<ProposedPosition> {
    const { cells } = this;
    const { walls } = this.args;

    const wallPositions = toPositions(walls);

    const yBound = cells.length,
      xBound = cells[0].length;

    const path: Array<ProposedPosition> = [];

    let currX = fromX,
      currY = fromY,
      valid = true;

    while (!(currX === toX && currY === toY)) {
      if (currY > toY) {
        currY--;
      } else if (currY < toY) {
        currY++;
      } else if (currX > toX) {
        currX--;
      } else if (currX < toX) {
        currX++;
      } else {
        throw new Error('There should be a change in this iteration.');
      }

      if (currX < 0 || currY < 0 || currX >= xBound || currY >= yBound) {
        return [];
      } else if (
        wallPositions.some(([wx, wy]) => wx === currX && wy === currY)
      ) {
        valid = false;
      }

      path.push({ position: [currX, currY], valid });
    }

    return path;
  }

  private getWallKey([y, x]: Position): string {
    return `${y}-${x}`;
  }
}
