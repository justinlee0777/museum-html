import RoomData from '../../src/data/room.data';
import ICell from '../../src/models/cell.interface';
import Position from '../../src/models/position.interface';
import TextRoom from '../../src/visualizations/text/room.text';

const player = Symbol('Player the user controls.');

class CustomTextRoom extends TextRoom {
  drawCell(cell: ICell): string {
    let text = super.drawCell(cell);

    if (cell.objects?.includes(player)) {
      const { length } = text;
      const midpoint = Math.floor(length / 2);

      text = text.slice(0, midpoint) + 'P' + text.slice(midpoint + 1);
    }

    return text;
  }
}

const mazeSize = 5;

const midpoint = Math.floor(mazeSize / 2);

const room = new RoomData({
  width: mazeSize,
  height: mazeSize,
});

const playerPosition: Position = [midpoint, midpoint];

room.place(player, playerPosition);

const textRoom = new CustomTextRoom();

console.log(textRoom.draw(room, playerPosition));
