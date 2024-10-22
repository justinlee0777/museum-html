import Cell from '../models/cell.model';
import MuseumObject from '../models/museum-object.model';
import ObjectRegistry from '../models/registries/object-registry.model';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface ObjectLayerArgs {
  cellSize: number;
}

export default class ObjectLayer {
  sprite: HTMLCanvasElement | undefined;

  constructor(
    private registry: ObjectRegistry,
    private args: ObjectLayerArgs,
    private cells: Array<Array<Cell>>,
    private objects: Array<MuseumObject>
  ) {}

  draw(): void {
    const { cells } = this;
    const { cellSize } = this.args;

    const canvas = document.createElement('canvas');

    canvas.height = cells.length * cellSize;
    canvas.width = cells[0].length * cellSize;

    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;

    for (const object of this.objects) {
      const {
        origin: [ox, oy],
      } = object;
      const drawSprite: DrawSprite = (
        image,
        sx,
        sy,
        sw,
        sh,
        offsetX = 0,
        offsetY = 0
      ) => {
        context.drawImage(
          image,
          sx,
          sy,
          sw,
          sh,
          (ox + offsetX) * cellSize,
          (oy + offsetY) * cellSize,
          cellSize,
          cellSize
        );
      };

      this.registry.draw(drawSprite, { object });
    }

    this.sprite = canvas;
  }
}
