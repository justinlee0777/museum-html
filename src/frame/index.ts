import styles from './index.module.css';

import {
  CompositeMuseumObjectInteraction,
  CompositeMuseumObjectInteractionChild,
} from '../models/museum-object.model';
import FrameRegistry from '../models/registries/frame-registry.model';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface PaintedObject {
  interaction: CompositeMuseumObjectInteractionChild;
  element: HTMLCanvasElement;
}

export interface FrameConfig {
  interaction: CompositeMuseumObjectInteraction;
  cellSize: number;

  onselect: (interaction: PaintedObject['interaction']) => void;
}

export class Frame {
  private initialized:
    | {
        container: HTMLElement;
        selected: PaintedObject;
        paintedObjects: Array<PaintedObject>;
      }
    | undefined;

  get element(): HTMLElement | undefined {
    return this.initialized?.container;
  }

  constructor(private config: FrameConfig, private registry: FrameRegistry) {}

  async draw(): Promise<HTMLElement> {
    const {
      config: {
        interaction: { frame, objects },
        cellSize,
      },
      registry,
    } = this;

    const container = document.createElement('div');
    container.className = styles.frameContainer;

    const canvas = document.createElement('canvas');
    const cellHeight = cellSize * frame.height;
    const cellWidth = cellSize * frame.width;
    canvas.height = cellHeight;
    canvas.width = cellWidth;
    canvas.className = styles.frame;

    const canvasContext = canvas.getContext('2d')!;
    canvasContext.imageSmoothingEnabled = false;

    const drawFrameOps: Array<Promise<void>> = [];

    for (let i = 0; i < frame.width; i++) {
      for (let j = 0; j < frame.height; j++) {
        const drawSprite: DrawSprite = (image, sx, sy, sw, sh) => {
          canvasContext.drawImage(
            image,
            sx,
            sy,
            sw,
            sh,
            i * cellSize,
            j * cellSize,
            cellSize,
            cellSize
          );
        };

        drawFrameOps.push(
          registry.drawFrame(drawSprite, {
            position: [i, j],
            frameHeight: frame.height,
            frameWidth: frame.width,
          })
        );
      }
    }

    await Promise.all(drawFrameOps);

    const paintedObjectPromises: Array<Promise<PaintedObject>> = objects.map(
      (object) => {
        let originX: number,
          originY: number,
          objectWidth = cellSize,
          objectHeight = cellSize;

        if ('origin' in object) {
          [originX, originY] = object.origin;

          objectWidth = object.width * cellSize;
          objectHeight = object.height * cellSize;
        } else {
          [originX, originY] = object.position;
        }

        const element = document.createElement('canvas');
        element.className = styles.frameObject;
        element.width = objectWidth;
        element.height = objectHeight;
        element.style.top = `${originY * cellSize}px`;
        element.style.left = `${originX * cellSize}px`;

        element.onclick = () => this.select(element);

        const elementContext = element.getContext('2d')!;
        elementContext.imageSmoothingEnabled = false;

        const drawSprite: DrawSprite = (image, sx, sy, sw, sh) => {
          elementContext.drawImage(
            image,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            objectWidth,
            objectHeight
          );
        };

        return registry.drawObject(drawSprite, object).then(() => ({
          interaction: object,
          element,
        }));
      }
    );

    const paintedObjects = await Promise.all(paintedObjectPromises);

    container.appendChild(canvas);

    container.append(...paintedObjects.map(({ element }) => element));

    const selected = paintedObjects[0];

    selected.element.classList.add(styles.frameObjectSelected);

    this.initialized = {
      container,
      paintedObjects,
      selected,
    };

    return container;
  }

  /**
   * If the object selected is not currently selected, then we paint a cursor around it.
   * If the object selected is already selected, then we trigger the "onselect" event.
   */
  select(objectElement?: HTMLCanvasElement): void {
    if (!this.initialized) {
      throw new Error('Need to call "draw()" first for Frame element.');
    }

    const { initialized } = this;

    const { paintedObjects, selected: currentSelected } = initialized;

    if (!objectElement || currentSelected.element === objectElement) {
      /*
       * Commit to the current selected element if the client either
       * 1) does not provide an element to select, thus committing to the currently selected element;
       * 2) re-commits to the currently selected element by passing in the same element.
       */
      this.config.onselect(currentSelected.interaction);
    } else {
      currentSelected.element.classList.remove(styles.frameObjectSelected);

      const selected = paintedObjects.find(
        ({ element }) => element === objectElement
      )!;

      selected.element.classList.add(styles.frameObjectSelected);

      this.initialized = {
        ...initialized,
        selected,
      };
    }
  }

  selectNext(
    direction: 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
  ): void {
    if (!this.initialized) {
      throw new Error('Need to call "draw()" first for Frame element.');
    }

    const { paintedObjects, selected } = this.initialized;

    const { length: numObjects } = paintedObjects;
    let currentIndex = paintedObjects.findIndex(
      (object) => object === selected
    );

    switch (direction) {
      case 'ArrowUp':
      case 'ArrowLeft':
        currentIndex--;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        currentIndex++;
        break;
    }

    currentIndex = currentIndex % numObjects;

    this.select(paintedObjects.at(currentIndex)!.element);
  }
}
