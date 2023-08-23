import ICell from '../models/cell.interface';
import Direction from '../models/direction.enum';
import Position from '../models/position.interface';

interface RoomConfig {
  height: number;
  width: number;
  starting?: Position;
}

export default class RoomData {
  private startingCell: ICell;
  private objects: Map<Symbol, ICell>;

  constructor({ height, width, starting }: RoomConfig) {
    let id = 0;

    this.objects = new Map();

    const cells = Array(height)
      .fill(undefined)
      .map((_, y) =>
        Array(width)
          .fill(undefined)
          .map<ICell>((_, x) => ({
            id: id++,
          }))
      );

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const cell = cells[i][j];

        if (i > 0) {
          cell.top = cells[i - 1][j];
        }
        if (j < width - 1) {
          cell.right = cells[i][j + 1];
        }
        if (i < height - 1) {
          cell.bottom = cells[i + 1][j];
        }
        if (j > 0) {
          cell.left = cells[i][j - 1];
        }
      }
    }

    const [x, y] = starting ?? [0, 0];

    this.startingCell = cells[y][x];
  }

  public start(): ICell {
    return this.startingCell;
  }

  public move(id: Symbol, direction: Direction): Array<ICell> {
    const cell = this.objects.get(id);

    if (cell) {
      let newCell: ICell | undefined;

      switch (direction) {
        case Direction.TOP:
          newCell = cell.top;
          break;
        case Direction.RIGHT:
          newCell = cell.right;
          break;
        case Direction.BOTTOM:
          newCell = cell.bottom;
          break;
        case Direction.LEFT:
          newCell = cell.left;
          break;
      }

      if (newCell) {
        return this.place(id, newCell);
      }
    }

    throw new Error('');
  }

  public place(id: Symbol, newCell: ICell): Array<ICell> {
    const changedCells = [];

    const oldCell = this.objects.get(id);

    let objects: Array<Symbol>;

    if (oldCell) {
      objects = oldCell.objects ?? [];

      objects = objects.filter((object) => object !== id);

      oldCell.objects = objects;

      changedCells.push(oldCell);
    }

    objects = newCell.objects ?? [];

    objects = objects.concat(id);

    newCell.objects = objects;

    this.objects.set(id, newCell);

    changedCells.push(newCell);

    return changedCells;
  }
}
