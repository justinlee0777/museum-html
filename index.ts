import LongPaintingSpriteImage from './src/assets/long-painting.png';
import WallSpriteImage from './src/assets/wall-1.png';
import TileSpriteImage from './src/assets/tile-1.png';
import PlacardSpriteImage from './src/assets/placard.png';

import SPRITE_SIZE from './src/consts/sprite-size.const';
import { MuseumWallType } from './src/models/museum-wall.model';
import Museum from './src/museum';

window.addEventListener('DOMContentLoaded', () => {
  const height = 8;
  const width = 16;

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
        width: 10,
        sprite: 'long-painting',
        interactions: [
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105278.jpg',
            position: [4, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105279.jpg',
            position: [5, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105280.jpg',
            position: [6, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105281.jpg',
            position: [7, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105282.jpg',
            position: [8, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105283.jpg',
            position: [9, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105284.jpg',
            position: [10, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105285.jpg',
            position: [11, 0],
          },
          {
            url: 'https://images.metmuseum.org/CRDImages/as/original/DP105286.jpg',
            position: [12, 0],
          },
        ],
      },
      {
        origin: [width - 2, 0],
        height: 1,
        width: 1,
        sprite: 'placard',
        interactions: [
          {
            description:
              'This scroll is the fourth in a set of twelve commissioned by the Qianlong Emperor to document his first tour in Southern China, made in 1751. The scroll portrays Qianlong inspecting flood-control measures along the Yellow River. He stands beside the spillway that directs the clear blue waters of the Huai River into the silt-laden Yellow River, diluting its sediment content and helping to flush the silt out to sea. The remainder of the scroll depicts various flood-prevention techniques, including double-sluice gates to reduce the force and flow of water in the Grand Canal, pounded-earth and stone-faced levees, and large bundles of sorghum used for repairing breaches in the dikes.',
            sameAsObject: true,
          },
        ],
      },
    ],
    walls: [
      {
        origin: [0, 0],
        width,
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
        origin: [width - 1, 0],
        height: 3,
      },
      {
        origin: [width - 1, 6],
        height: 2,
      },
      {
        origin: [0, 7],
        width,
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
        draw(drawSprite, { object }) {
          if (!('width' in object)) {
            throw new Error('Long paintings need a width.');
          }

          const { sprite, width } = object;

          const image = new Image();

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
              };

              image.src = LongPaintingSpriteImage;
              break;
            case 'placard':
              image.onload = () => {
                drawSprite(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
              };

              image.src = PlacardSpriteImage;
              break;
          }
        },
      },
    },
  });

  const museumElement = museum.draw();

  museum.addKeyListeners();

  document.body.appendChild(museumElement);
});
