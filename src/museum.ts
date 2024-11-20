import styles from './museum.module.css';

import Cell from './models/cell.model';
import { Position, ProposedPosition, Location } from './models/position.model';
import { MuseumArgs } from './models/museum-args.model';
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
import HelpMenu from './help-menu';
import OutOfFocusMessage from './out-of-focus-message';
import detectMobile from './utils/detect-mobile.function';
import { ButtonBarState, MobileButtonBar } from './mobile-button-bar';
import { OnExit } from './models/callbacks.model';
import { MuseumWall } from './models';
import { Frame } from './frame';

export default class Museum<ExitPointData = void> {
  public onexit?: OnExit<ExitPointData>;

  private cells: Array<Array<Cell>>;

  private impassablePositions: Set<string>;

  private playerPosition: Position;

  private playerSprite: PlayerSprite;

  private initialized:
    | {
        museumElement: HTMLElement;
        museumFrameElement: HTMLElement;
        width: number;
        height: number;
        destinationLayer: DestinationLayer;
      }
    | undefined;

  private interactionContext:
    | {
        interactionFrame: HTMLElement;
        painting?: Painting;
        frame?: Frame;
      }
    | undefined;

  private outOfFocusMessage: OutOfFocusMessage | undefined;

  /** Defined only if @see onMobile is true. */
  private mobileButtonBar: MobileButtonBar | undefined;

  private walkingLock: Symbol | undefined;

  private onMobile: boolean;

  constructor(public args: MuseumArgs<ExitPointData>) {
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

    const wallPositions = (this.impassablePositions = new Set());

    const impassable = (walls as Array<MuseumWall | MuseumObject>).concat(
      objects.filter((object) => object.impassable)
    );

    for (const impassableObj of impassable) {
      let range: Array<Position>;

      if ('origin' in impassableObj) {
        const {
          origin: [ox, oy],
        } = impassableObj;

        let height = 1,
          width = 1;

        if ('height' in impassableObj) {
          height = impassableObj.height;
          range = Array(impassableObj.height)
            .fill(undefined)
            .map((_, i) => [ox, oy + i]);
        }

        if ('width' in impassableObj) {
          width = impassableObj.width;
        }

        range = Array(width)
          .fill(undefined)
          .reduce((acc, _, i) => {
            return acc.concat(
              Array(height)
                .fill(undefined)
                .map((_, j) => [ox + i, oy + j])
            );
          }, []);
      } else {
        const { position } = impassableObj;

        range = [position];
      }

      for (const position of range) {
        wallPositions.add(this.getWallKey(position));
      }
    }

    this.playerPosition = playerPosition;

    const playerSprite = (this.playerSprite = player);

    playerSprite.draw({ cellSize });

    playerSprite.sprite!.classList.add(styles.player);

    this.onMobile = detectMobile();
  }

  async draw(): Promise<HTMLElement> {
    const { cells } = this;
    const { cellSize, objects, walls, registries } = this.args;

    const height = cells.length * cellSize;
    const width = cells[0].length * cellSize;

    const museumElement = document.createElement('div');
    museumElement.tabIndex = 0;
    museumElement.className = styles.museum;

    const museumFrameElement = document.createElement('div');
    museumFrameElement.className = styles.museumFrame;

    const canvasElement = document.createElement('canvas');
    canvasElement.height = height;
    canvasElement.width = width;

    const layerDraws: Array<Promise<void>> = [];

    const tileLayer = new TileLayer(registries.tile, { cellSize }, cells);

    layerDraws.push(tileLayer.draw(canvasElement));

    const wallLayer = new WallLayer(
      registries.wall,
      { cellSize },
      cells,
      walls
    );

    layerDraws.push(wallLayer.draw(canvasElement));

    const objectLayer = new ObjectLayer(
      registries.object,
      { cellSize },
      objects
    );

    layerDraws.push(objectLayer.draw(canvasElement));

    await Promise.all(layerDraws);

    const destinationLayer = new DestinationLayer({
      cellSize,
      height,
      width,
      cells,
      walls,
    });

    destinationLayer.draw();

    museumFrameElement.append(canvasElement, destinationLayer.element!);

    museumFrameElement.appendChild(this.playerSprite.sprite!);

    museumElement.appendChild(museumFrameElement);

    const mobileButtonBar = (this.mobileButtonBar = new MobileButtonBar({
      mobile: this.onMobile,
      walking: {
        onhelpmenuopen: () => {
          this.openHelpMenu();
        },
      },
      examinePainting: {
        onclose: () => {
          this.closeInteraction();
        },
        onzoomin: () => this.zoomInPainting(),
        onzoomout: () => this.zoomOutPainting(),
      },
      examineFrame: {
        onclose: () => this.closeInteraction(),
      },
      examineText: {
        onclose: () => this.closeInteraction(),
      },
      helpMenu: {
        onclose: () => {
          this.closeInteraction();
        },
      },
    }));

    mobileButtonBar.draw(ButtonBarState.WALKING);

    const mobileButtonBarElement = mobileButtonBar.element!;

    museumElement.appendChild(mobileButtonBarElement);

    this.initialized = {
      museumElement,
      museumFrameElement,
      width,
      height,
      destinationLayer,
    };

    // As the player sprite is dependent on the sizing of the museum, we shall wait for the museum to be initialized before drawing the player
    let observer: MutationObserver;
    observer = new MutationObserver(() => {
      if (document.contains(museumElement)) {
        this.drawPlayer(true);
        observer.disconnect();
      }
    });

    observer.observe(document, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
    });
    //

    return museumElement;
  }

  /*
   * TODO Wondering if there's any wisdom in ripping out the event system directly from the museum itself
   * and abstracting these actions.
   * Something to refactor is the large switch statement. An idea would be to break the switch statement into multiple switch statements,
   * mapped to the current state of the application.
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
                this.closeInteraction();
                break;
              case 'A':
              case 'a':
                if (this.interactionContext) {
                  const { frame } = this.interactionContext;

                  if (frame) {
                    frame.select();
                  }
                } else {
                  await this.searchAndOpenInteraction();
                }
                break;
              case 'Enter':
                if (!this.interactionContext) {
                  this.openHelpMenu();
                }
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
                if (this.interactionContext) {
                  const { frame } = this.interactionContext;

                  if (frame) {
                    frame.selectNext(key);
                  }
                } else {
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
      const { interactionContext } = this;

      if (!interactionContext || interactionContext.frame) {
        // Prevent scrolling if the user is walking or objects are being chosen in a frame.
        event.preventDefault();
      }

      pressedKeys.add(event.key);
      updatePlayer();
    });

    museumElement.addEventListener('keyup', (event) => {
      const { interactionContext } = this;

      if (!interactionContext || interactionContext.frame) {
        // Prevent scrolling if the user is walking or objects are being chosen in a frame.
        event.preventDefault();
      }

      pressedKeys.delete(event.key);
      updatePlayer();
    });

    museumElement.addEventListener('click', async (event) => {
      if (this.interactionContext) {
        return;
      }

      const { museumFrameElement } = this.initialized!;
      museumFrameElement.focus();

      const { cellSize } = this.args;

      const { x: museumFrameX, y: museumFrameY } =
        museumFrameElement.getBoundingClientRect();

      const destinationPosition: Position = [
        Math.floor(
          (museumFrameElement.scrollLeft + (event.x - museumFrameX)) / cellSize
        ),
        Math.floor(
          (museumFrameElement.scrollTop + (event.y - museumFrameY)) / cellSize
        ),
      ];

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
            await this.searchAndOpenInteraction(destinationPosition);
          }
        }
      }
    });

    const onMuseumBlur = () => {
      const outOfFocusMessage = (this.outOfFocusMessage =
        new OutOfFocusMessage());

      outOfFocusMessage.draw();

      const { museumElement } = this.initialized!;
      const outOfFocusElement = outOfFocusMessage.element!;

      museumElement.appendChild(outOfFocusElement);
    };

    museumElement.addEventListener('focusout', onMuseumBlur);

    museumElement.addEventListener('focusin', () => {
      const { museumElement } = this.initialized!;

      if (this.outOfFocusMessage) {
        museumElement.removeChild(this.outOfFocusMessage.element!);
      }

      this.outOfFocusMessage = undefined;
    });

    if (document.activeElement !== museumElement) {
      onMuseumBlur();
    }
  }

  private isObjectInCell(position: Position, object: MuseumObject): boolean {
    return this.withinBounds(object, position);
  }

  private canUpdatePlayer(newPosition: Position): boolean {
    const { height, width } = this.args;

    return (
      newPosition.every((pos) => pos >= 0) &&
      newPosition[0] < width &&
      newPosition[1] < height &&
      !this.impassablePositions.has(this.getWallKey(newPosition))
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

    const { museumFrameElement } = this.initialized!;

    const playerX = x * cellSize;
    const playerY = y * cellSize;

    const diffX = museumFrameElement.clientWidth / 2;
    const diffY = museumFrameElement.clientHeight / 2;

    return [Math.max(0, playerX - diffX), Math.max(0, playerY - diffY)];
  }

  private drawPlayer(initial = false) {
    const { playerPosition } = this;

    const [top, left] = this.getTopLeftValues(playerPosition);

    this.playerSprite.sprite!.style.top = top;
    this.playerSprite.sprite!.style.left = left;

    const { museumFrameElement } = this.initialized!;

    const [scrollLeft, scrollTop] = this.getCameraOrigin();

    museumFrameElement.scroll({
      top: scrollTop,
      left: scrollLeft,
      behavior: initial ? undefined : 'smooth',
    });
  }

  private async movePlayer(
    key: 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
  ) {
    const { playerPosition, onexit } = this;
    const { cellSize, exitPoints } = this.args;
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

    if (exitPoints) {
      const discoveredExitPoint = exitPoints?.find((exitPoint) =>
        this.withinBounds(exitPoint, newPosition)
      );

      if (discoveredExitPoint) {
        // Kill the current walking animation
        this.walkingLock = undefined;
        await onexit?.(discoveredExitPoint);
      }
    }
  }

  private createInteractionFrame(): HTMLElement {
    const interactionFrame = document.createElement('div');
    interactionFrame.className = styles.interactionFrame;
    interactionFrame.tabIndex = 0;

    return interactionFrame;
  }

  private async searchAndOpenInteraction(
    destination?: Position
  ): Promise<void> {
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
      const newPosition: Position = [newX, newY];

      let withinBounds: boolean;

      if ('origin' in interaction || 'position' in interaction) {
        withinBounds = this.withinBounds(interaction, newPosition);
      } else {
        const { object } = interaction;

        withinBounds = this.withinBounds(object, newPosition);
      }

      // going to assume objects / interactions do not overlap.
      if (withinBounds) {
        this.openObjectDescription(interaction);

        return;
      }
    }
  }

  /**
   * TODO: this should probably look at the object in the cell rather than every object. That being said, I imagine
   * performance loss is negligible ATM.
   */
  private async openObjectDescription(
    interaction: MuseumObjectInteraction
  ): Promise<void> {
    const { cellSize } = this.args;
    const { museumElement } = this.initialized!;

    if (this.interactionContext) {
      this.interactionContext.interactionFrame.remove();
      this.interactionContext = undefined;
    }

    const interactionFrame = this.createInteractionFrame();

    let painting: Painting | undefined,
      frame: Frame | undefined,
      buttonBarState: ButtonBarState;

    if ('description' in interaction) {
      buttonBarState = ButtonBarState.EXAMINE_TEXT;

      const objectDescription = new ObjectDescription(interaction);

      objectDescription.draw();

      interactionFrame.appendChild(objectDescription.element!);
    } else if ('url' in interaction) {
      buttonBarState = ButtonBarState.EXAMINE_PAINTING;

      painting = new Painting(interaction);

      painting.draw();

      interactionFrame.appendChild(painting.element!);
    } else {
      buttonBarState = ButtonBarState.EXAMINE_FRAME;

      frame = new Frame(
        {
          cellSize,
          interaction,
          onselect: (interaction) => {
            this.openObjectDescription(interaction);
          },
        },
        this.args.registries.frame!
      );

      const frameElement = await frame.draw();

      interactionFrame.appendChild(frameElement);
    }

    museumElement.appendChild(interactionFrame);

    interactionFrame.focus();

    this.interactionContext = {
      interactionFrame,
      painting,
      frame,
    };

    this.mobileButtonBar?.draw(buttonBarState);
  }

  private openHelpMenu(): void {
    if (this.interactionContext) {
      this.interactionContext.interactionFrame.remove();
      this.interactionContext = undefined;
    }

    const interactionFrame = this.createInteractionFrame();

    const helpMenu = new HelpMenu({
      mobile: this.onMobile,
    });

    helpMenu.draw();

    interactionFrame.appendChild(helpMenu.element!);

    const { museumElement } = this.initialized!;

    museumElement.appendChild(interactionFrame);

    this.interactionContext = {
      interactionFrame,
    };

    this.mobileButtonBar?.draw(ButtonBarState.HELP_MENU);
  }

  private closeInteraction(): void {
    if (this.interactionContext) {
      this.interactionContext.interactionFrame.remove();
      this.interactionContext = undefined;
      this.initialized!.museumElement.focus();

      this.mobileButtonBar?.draw(ButtonBarState.WALKING);
    }
  }

  private zoomInPainting(): void {
    if (this.interactionContext) {
      this.interactionContext.painting?.zoomIn();
    }
  }

  private zoomOutPainting(): void {
    if (this.interactionContext) {
      this.interactionContext.painting?.zoomOut();
    }
  }

  private calculatePath(
    [fromX, fromY]: Position,
    [toX, toY]: Position
  ): Array<ProposedPosition> {
    const { cells, impassablePositions } = this;

    const yBound = cells.length,
      xBound = cells[0].length;

    const path: Array<ProposedPosition> = [];

    let currX = fromX,
      currY = fromY,
      valid = true;

    const impassableArr = [...impassablePositions].map(this.decodeWallKey);

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
        impassableArr.some(([wx, wy]) => wx === currX && wy === currY)
      ) {
        valid = false;
      }

      path.push({ position: [currX, currY], valid });
    }

    return path;
  }

  private getWallKey([x, y]: Position): string {
    return `${x}-${y}`;
  }

  private decodeWallKey(wallKey: string): Position {
    const [, x, y] = wallKey.match(/(\d+)-(\d+)/)!;

    return [Number(x), Number(y)];
  }

  private withinBounds(location: Location, [cellX, cellY]: Position): boolean {
    let x: number,
      y: number,
      height = 1,
      width = 1;

    if ('origin' in location) {
      [x, y] = location.origin;
      ({ height, width } = location);
    } else {
      [x, y] = location.position;
    }

    return cellY >= y && cellY < y + height && cellX >= x && cellX < x + width;
  }
}
