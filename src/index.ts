import './index.css';
import { RoomData, RoomUI } from './room';

window.addEventListener('DOMContentLoaded', () => {
  const mazeSize = Number(
    getComputedStyle(document.documentElement).getPropertyValue('--maze-size')
  );

  const midpoint = Math.floor(mazeSize / 2);

  const room = new RoomData({
    width: mazeSize,
    height: mazeSize,
    player: {
      position: [midpoint, midpoint],
    },
  });

  const roomUI = new RoomUI();

  const roomElement = roomUI.draw(room);

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        room.movePlayer([0, -1]);
        break;
      case 'ArrowRight':
        room.movePlayer([1, 0]);
        break;
      case 'ArrowDown':
        room.movePlayer([0, 1]);
        break;
      case 'ArrowLeft':
        room.movePlayer([-1, 0]);
        break;
    }
    roomUI.draw(room);
  });

  document.body.appendChild(roomElement);
});
