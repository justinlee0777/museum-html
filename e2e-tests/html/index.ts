import styles from './index.module.css';

import ICell from '../../src/models/cell.interface';
import Position from '../../src/models/position.interface';
import RoomData from '../../src/data/room.data';
import HTMLRoom from '../../src/visualizations/html/room.html';
import Direction from '../../src/models/direction.enum';
import DiamondRoomData from '../../src/data/variants/diamond/room.data';

const player = Symbol('Player the user controls.');

class MazeUI extends HTMLRoom {
  public drawCell(cell: ICell): HTMLElement {
    const element = super.drawCell(cell);

    const [x, y] = cell.position;
    element.textContent = `${y}, ${x}`;

    if (cell.objects?.includes(player)) {
      element.classList.add(styles['has-player']);
    } else {
      element.classList.remove(styles['has-player']);
    }

    return element;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  let room: RoomData;
  let roomUI: MazeUI;

  let currentValue = 'square';

  function createRoom() {
    if (room) {
      room.destroy();
    }

    if (roomUI) {
      roomUI.destroy();
    }

    const mazeSize = Number(
      getComputedStyle(document.documentElement).getPropertyValue('--maze-size')
    );

    const midpoint = Math.floor(mazeSize / 2);

    switch (currentValue) {
      case 'diamond':
        room = new DiamondRoomData({
          size: mazeSize,
        });
        break;
      default:
        room = new RoomData({
          width: mazeSize,
          height: mazeSize,
        });
    }

    let playerPosition: Position = [midpoint, midpoint];

    room.place(player, playerPosition);

    roomUI = new MazeUI();

    const roomElement = roomUI.draw(room, playerPosition);

    function changePlayerPosition(change: Position): () => void {
      return () => {
        const newPosition = playerPosition.map(
          (axis, i) => (axis += change[i])
        ) as Position;

        try {
          room.place(player, newPosition);

          playerPosition = newPosition;

          roomUI.draw(room, playerPosition);
        } catch {}
      };
    }

    roomUI.addNavigation({
      [Direction.TOP]: changePlayerPosition([0, -1]),
      [Direction.RIGHT]: changePlayerPosition([1, 0]),
      [Direction.BOTTOM]: changePlayerPosition([0, 1]),
      [Direction.LEFT]: changePlayerPosition([-1, 0]),
    });

    document.body.appendChild(roomElement);
  }

  const values = [currentValue, 'diamond'];

  const select = document.createElement('select');

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.label = value;
    option.selected = value === currentValue;

    select.appendChild(option);
  });

  select.addEventListener('change', (event) => {
    currentValue = (event.target as HTMLOptionElement).value;
    createRoom();
  });

  document.body.appendChild(select);

  createRoom();
});
