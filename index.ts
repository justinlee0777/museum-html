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
  });

  const museumElement = museum.draw();

  museum.addKeyListeners();

  document.body.appendChild(museumElement);
});
