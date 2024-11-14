import { Museum, Position } from '../index';
import { MuseumPartial } from './museum-partial.model';
import { registries } from './registries.const';
import { room216Args } from './room-216.const';
import { rooms } from './rooms.const';
import { TestExitPoint } from './test-exit-point.model';

window.addEventListener('DOMContentLoaded', async () => {
  async function drawMuseum(
    museumArgs: MuseumPartial,
    playerPosition: Position
  ) {
    document.body.innerHTML = '';

    const museum = new Museum({
      playerPosition,
      registries,
      ...museumArgs,
    });

    museum.onexit = async (exitPoint: TestExitPoint) => {
      const room = rooms.find(
        (r) => r.id === exitPoint.metadata.enteringRoomId
      )!;

      await drawMuseum(room, exitPoint.metadata.playerPosition);
    };

    const museumElement = await museum.draw();

    /**
     * CHANGE CAMERA
     */

    museum.addKeyListeners();

    document.body.appendChild(museumElement);

    museumElement.focus();
  }

  const playerPosition: Position = [1, 4];

  drawMuseum(room216Args, playerPosition);
});
