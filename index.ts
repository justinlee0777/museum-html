import LongPaintingSpriteImage from './src/assets/long-painting.png';
import WallSpriteImage from './src/assets/wall-1.png';
import TileSpriteImage from './src/assets/tile-1.png';

import SPRITE_SIZE from './src/consts/sprite-size.const';
import { MuseumWallType } from './src/models/museum-wall.model';
import Museum from './src/museum';

window.addEventListener('DOMContentLoaded', () => {
  const height = 8;
  const width = 10;

  const cellSize = 32;

  const museum = new Museum({
    height,
    width,
    cellSize,
    playerPosition: [0, 4],
    objects: [
      {
        origin: [4, 0],
        height: 1,
        width: 5,
        sprite: 'long-painting',
      },
    ],
    walls: [
      {
        origin: [0, 0],
        width: 10,
      },
      {
        origin: [0, 0],
        height: 3,
      },
      {
        origin: [0, 6],
        height: 2,
      },
      {
        origin: [9, 0],
        height: 3,
      },
      {
        origin: [9, 6],
        height: 2,
      },
      {
        origin: [0, 7],
        width: 10,
      },
    ],
    registries: {
      tile: {
        draw(drawSprite) {
          const image = new Image();

          image.onload = () => {
            drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
          };

          image.src = TileSpriteImage;
        },
      },
      wall: {
        draw(drawSprite, { wallType }) {
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
        },
      },
      object: {
        draw(drawSprite, { object: { width } }) {
          const image = new Image();

          image.onload = () => {
            // left side
            drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

            // middle
            Array(width - 2)
              .fill(undefined)
              .forEach((_, i) => {
                drawSprite(
                  image,
                  SPRITE_SIZE,
                  0,
                  SPRITE_SIZE,
                  SPRITE_SIZE,
                  i + 1
                );
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
        },
      },
    },
  });

  const museumElement = museum.draw();

  museum.addKeyListeners();

  document.body.appendChild(museumElement);
});
