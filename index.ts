import Museum from './src/museum';

window.addEventListener('DOMContentLoaded', () => {
  const height = 8;
  const width = 10;

  const museum = new Museum({
    height,
    width,
    cellSize: 32,
    playerPosition: [4, 0],
  });

  const museumElement = museum.draw();

  museum.addKeyListeners();

  document.body.appendChild(museumElement);
});
