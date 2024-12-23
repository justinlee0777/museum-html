import { MuseumPartial } from './museum-partial.model';
import { TestExitPoint } from './test-exit-point.model';

const height = 8;
const width = 16;

const cellSize = 48;

const westExitPoint: TestExitPoint = {
  origin: [width - 1, 3],
  height: 3,
  width: 1,
  metadata: {
    enteringRoomId: 'room215',
    playerPosition: [1, 4],
  },
};

export const room216Args: MuseumPartial = {
  id: 'room216',
  height,
  width,
  cellSize,
  objects: [
    {
      origin: [2, 0],
      height: 1,
      width: 1,
      sprite: 'fan',
      interactions: [
        {
          frame: {
            width: 5,
            height: 7,
          },
          objects: [
            {
              origin: [1, 1],
              width: 3,
              height: 3,
              url: 'https://images.metmuseum.org/CRDImages/as/original/DP104399.jpg',
              sprite: 'painting',
            },
            {
              position: [2, 5],
              sprite: 'placard',
              artist: 'Me',
              title: 'Foo',
              acquisition: '',
              context: '',
              make: '',
              description: '',
            },
          ],
          sameAsObject: true,
        },
      ],
    },
    {
      origin: [5, 0],
      height: 1,
      width: 9,
      sprite: 'long-painting',
      interactions: [
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105286.jpg',
          position: [5, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105285.jpg',
          position: [6, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105284.jpg',
          position: [7, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105283.jpg',
          position: [8, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105282.jpg',
          position: [9, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105281.jpg',
          position: [10, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105280.jpg',
          position: [11, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105279.jpg',
          position: [12, 0],
        },
        {
          url: 'https://images.metmuseum.org/CRDImages/as/original/DP105278.jpg',
          position: [13, 0],
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
          artist: 'Xu Yang',
          title: `The Qianlong Emperor's Southern Inspection Tour, Scroll Four: The Confluence of the Huai and Yellow Rivers`,
          context: 'Qing Dynasty (1644 - 1911), dated 1770',
          make: 'Handscroll; ink and color on silk',
          acquisition: 'Purchase, The Dillon Fund Gift, 1984 (1984.16)',
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
  exitPoints: [westExitPoint],
};
