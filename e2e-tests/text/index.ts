import RoomData from '../../src/data/room.data';
import DiamondRoomData from '../../src/data/variants/diamond/room.data';
import ICell from '../../src/models/cell.interface';
import Position from '../../src/models/position.interface';
import TextRoom from '../../src/visualizations/text/room.text';

const [roomShape] = process.argv.slice(2);

interface CellData {
  hasPlayer?: boolean;
}

class CustomTextRoom extends TextRoom<CellData> {
  drawCell(cell: ICell<CellData>): string {
    let text = super.drawCell(cell);

    if (cell.data?.hasPlayer) {
      const { length } = text;
      const midpoint = Math.floor(length / 2);

      text = text.slice(0, midpoint) + 'P' + text.slice(midpoint + 1);
    }

    return text;
  }
}

const mazeSize = 5;

const midpoint = Math.floor(mazeSize / 2);

let room: RoomData<CellData>;

switch (roomShape) {
  case 'diamond':
    room = new DiamondRoomData<CellData>({
      size: mazeSize,
    });
    break;
  default:
    room = new RoomData<CellData>({
      width: mazeSize,
      height: mazeSize,
    });
}

const playerPosition: Position = [midpoint, midpoint];

room.updateCell(playerPosition, { hasPlayer: true });

const textRoom = new CustomTextRoom();

console.log(textRoom.draw(room, playerPosition));
