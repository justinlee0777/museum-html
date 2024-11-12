import { MuseumObject } from '../models/museum-object.model';
import ObjectRegistry from '../models/registries/object-registry.model';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface ObjectLayerArgs {
  cellSize: number;
}

export default class ObjectLayer {
  constructor(
    private registry: ObjectRegistry,
    private args: ObjectLayerArgs,
    private objects: Array<MuseumObject>
  ) {}

  async draw(canvas: HTMLCanvasElement): Promise<void> {
    const { cellSize } = this.args;

    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;

    await Promise.all(
      this.objects.map(async (object) => {
        let ox: number, oy: number;

        if ('origin' in object) {
          [ox, oy] = object.origin;
        } else {
          [ox, oy] = object.position;
        }

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

        await this.registry.draw(drawSprite, { object });
      })
    );
  }
}
