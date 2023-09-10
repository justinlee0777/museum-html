import RoomData from '../../room.data';
import RoomConfig from './room.config';
import BaseRoomConfig from '../../room.config';

export default class DiamondRoomData extends RoomData {
  constructor(config: RoomConfig) {
    const { size } = config;
    const baseConfig: BaseRoomConfig = {
      ...config,
      width: size,
      height: size,
    };
    super(baseConfig);

    let start: number, end: number;

    if (size % 2 === 0) {
      end = size / 2;
      start = end - 1;
    } else {
      start = end = Math.floor(size / 2);
    }

    const midpoint = end;

    let i = 0;

    while (i < midpoint) {
      const rows = [this.cells[i], this.cells[size - i - 1]];

      rows.forEach((row) => {
        row.forEach((cell, i) => {
          if (cell && (i < start || i > end)) {
            this.removeCell(cell.position);
          }
        });
      });

      start--;
      end++;

      i++;
    }
  }
}
