import WallSpriteImage from '../../assets/wall-1.png';
import SPRITE_SIZE from '../../consts/sprite-size.const';

import { MuseumWallType } from '../../models/museum-wall.model';
import DrawSprite from '../models/draw-sprite.model';

export default class WallSprite {
  static draw(drawSprite: DrawSprite, wallType: MuseumWallType): void {
    const image = new Image();

    image.onload = () => {
      let sx: number, sy: number;

      switch (wallType) {
        case MuseumWallType.VERTICAL:
          (sx = 0), (sy = SPRITE_SIZE);
          break;
        case MuseumWallType.INTERSECTING:
          (sx = 0), (sy = 0);
          break;
        default:
          (sx = SPRITE_SIZE), (sy = 0);
          break;
      }

      drawSprite(image, sx, sy, SPRITE_SIZE, SPRITE_SIZE);
    };

    image.src = WallSpriteImage;
  }
}
