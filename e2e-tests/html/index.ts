import styles from './index.module.css';

import {
  AnimateOptions,
  animate,
  calculateFrames,
} from '@justinlee0777/components/utils/animate';
import { lock } from '@justinlee0777/components/utils/lock';

import ICell from '../../src/models/cell.interface';
import Position from '../../src/models/position.interface';
import RoomData from '../../src/data/room.data';
import HTMLRoom from '../../src/visualizations/html/room.html';
import Direction from '../../src/models/direction.enum';
import DiamondRoomData from '../../src/data/variants/diamond/room.data';
import Camera from '../../src/models/camera.interface';
import paintPlayer from './paint-player.function';

const player = Symbol('Player the user controls.');

const cellSizeInPixels = 100;

class MazeUI extends HTMLRoom {
  public drawCell(cell: ICell): HTMLElement {
    const element = super.drawCell(cell);

    const [x, y] = cell.position;
    element.textContent = `${y}, ${x}`;

    if (cell.objects?.includes(player)) {
      const playerElement = paintPlayer(cellSizeInPixels);

      playerElement.classList.add(styles.player);
      playerElement.style.maxWidth = `${cellSizeInPixels}px`;
      playerElement.style.maxHeight = `${cellSizeInPixels}px`;

      element.appendChild(playerElement);
    } else {
      element.querySelector(`.${styles.player}`)?.remove();
    }

    return element;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  let room: RoomData;
  let roomUI: MazeUI;

  let currentValue = 'square';

  const camera: Camera = [5, 5];

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

    roomUI = new MazeUI(cellSizeInPixels);

    const roomElement = roomUI.draw(room, playerPosition, camera);

    const changePlayerPosition = lock(async (change: Position) => {
      const newPosition = playerPosition.map(
        (axis, i) => (axis += change[i])
      ) as Position;

      let bound: string;

      if (change[0] === 1) bound = 'left';
      if (change[0] === -1) bound = 'right';
      if (change[1] === 1) bound = 'top';
      if (change[1] === -1) bound = 'bottom';

      try {
        room.place(player, newPosition);

        playerPosition = newPosition;

        const options: AnimateOptions = {
          msPerFrame: 1000 / 60,
          duration: 300,
        };

        const frames = calculateFrames(options);

        const distance = 100 / frames;

        let changedDistance = 0;

        const playerElement = document.querySelector(
          `.${styles.player}`
        ) as HTMLElement;

        await animate(() => {
          playerElement.style[bound as any] = `${(changedDistance +=
            distance)}px`;
        }, options);

        roomUI.draw(room, playerPosition, camera);
      } catch {}
    });

    roomUI.addNavigation({
      [Direction.TOP]: () => changePlayerPosition([0, -1]),
      [Direction.RIGHT]: () => changePlayerPosition([1, 0]),
      [Direction.BOTTOM]: () => changePlayerPosition([0, 1]),
      [Direction.LEFT]: () => changePlayerPosition([-1, 0]),
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
