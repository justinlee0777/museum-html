import DrawSprite from '../../sprites/models/draw-sprite.model';
import { MuseumObject } from '../museum-object.model';

interface ObjectArgs {
  object: MuseumObject;
}

export default interface ObjectRegistry {
  draw(drawSprite: DrawSprite, args: ObjectArgs): Promise<void>;
}
