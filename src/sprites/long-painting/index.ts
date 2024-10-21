import LongPaintingSpriteImage from '../../assets/long-painting.png';

import SPRITE_SIZE from '../../consts/sprite-size.const';
import DrawSprite from '../models/draw-sprite.model';

interface LongPaintingSpriteArgs {
  width: number;
}

export default class LongPaintingSprite {
  static draw(drawSprite: DrawSprite, args: LongPaintingSpriteArgs): void {
    const { width } = args;

    const image = new Image();

    image.onload = () => {
      // left side
      drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

      // middle
      Array(width - 2)
        .fill(undefined)
        .forEach((_, i) => {
          drawSprite(image, SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, i + 1);
        });

      // right side
      drawSprite(
        image,
        SPRITE_SIZE * 2,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        width - 1
      );
    };

    image.src = LongPaintingSpriteImage;
  }
}
