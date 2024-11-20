import LongPaintingSpriteImage from './assets/long-painting.png';
import PaintingSpriteImage from './assets/painting.png';
import WallSpriteImage from './assets/wall-1.png';
import TileSpriteImage from './assets/tile-1.png';
import PlacardSpriteImage from './assets/placard.png';
import FanSpriteImage from './assets/fan.png';
import FrameImage from './assets/frame.png';

import { MuseumWallType } from '../index';
import TestPlayerSprite from './player-sprite';
import { MuseumArgs } from '../src/models';

const SPRITE_SIZE = 16;

export const registries: MuseumArgs['registries'] = {
  player: new TestPlayerSprite(),
  tile: {
    draw(drawSprite) {
      const image = new Image();

      return new Promise((resolve) => {
        image.onload = () => {
          drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
          resolve();
        };

        image.src = TileSpriteImage;
      });
    },
  },
  wall: {
    draw(drawSprite, { wallType }) {
      const image = new Image();

      return new Promise((resolve) => {
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

          resolve();
        };

        image.src = WallSpriteImage;
      });
    },
  },
  object: {
    draw(drawSprite, { object }) {
      if (!('width' in object)) {
        throw new Error('Long paintings need a width.');
      }

      const { sprite, width } = object;

      const image = new Image();

      return new Promise((resolve) => {
        switch (sprite) {
          case 'long-painting':
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

              resolve();
            };

            image.src = LongPaintingSpriteImage;
            break;
          case 'placard':
            image.onload = () => {
              drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

              resolve();
            };

            image.src = PlacardSpriteImage;
            break;
          case 'fan':
            image.onload = () => {
              drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

              resolve();
            };

            image.src = FanSpriteImage;
            break;
        }
      });
    },
  },
  frame: {
    async drawFrame(drawSprite, { frameHeight, position: [, y] }) {
      const image = new Image();

      return new Promise((resolve) => {
        image.onload = () => {
          if (y === frameHeight - 1) {
            drawSprite(image, 0, SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
          } else {
            drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
          }

          resolve();
        };

        image.src = FrameImage;
      });
    },
    async drawObject(drawSprite, interaction) {
      const image = new Image();

      return new Promise((resolve) => {
        switch (interaction.sprite) {
          case 'painting':
            image.onload = () => {
              drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

              resolve();
            };

            image.src = PaintingSpriteImage;
            break;
          case 'placard':
            image.onload = () => {
              drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

              resolve();
            };

            image.src = PlacardSpriteImage;
            break;
        }
      });
    },
  },
};
