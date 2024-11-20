import DrawSprite from '../../sprites/models/draw-sprite.model';
import { CompositeMuseumObjectInteractionChild } from '../museum-object.model';
import { Position } from '../position.model';

interface DrawFrameArgs {
  position: Position;
  frameHeight: number;
  frameWidth: number;
}

export default interface FrameRegistry {
  drawFrame(drawSprite: DrawSprite, args: DrawFrameArgs): Promise<void>;

  drawObject(
    drawSprite: DrawSprite,
    interaction: CompositeMuseumObjectInteractionChild
  ): Promise<void>;
}
