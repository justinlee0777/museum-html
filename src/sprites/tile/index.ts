import TileSpriteImage from '../../assets/tile-1.png';

import SPRITE_SIZE from '../../consts/sprite-size.const';
import DrawSprite from '../models/draw-sprite.model';

export default class TileSprite {
  static draw(drawSprite: DrawSprite): void {
    const image = new Image();

    image.onload = () => {
      drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
    };

    image.src = TileSpriteImage;
  }
}
