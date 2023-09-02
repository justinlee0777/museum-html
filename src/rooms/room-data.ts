import ICell from '../models/cell.interface';
import Dimensions from '../models/dimensions.interface';
import Position from '../models/position.interface';
import clamp from '../utils/clamp.function';

type Cells = Array<Array<ICell | undefined>>;

interface RoomConfig {
  height: number;
  width: number;
}

type OriginPlacement = 'start' | 'center' | 'end';

type OriginType = [OriginPlacement, OriginPlacement];

export default class RoomData {
  private roomDimensions: Dimensions;
  private cells: Cells;
  private objects: Map<Symbol, Position>;

  constructor({ height, width }: RoomConfig) {
    this.roomDimensions = [width, height];

    this.objects = new Map();

    this.cells = Array(height)
      .fill(undefined)
      .map((_, j) =>
        Array(width)
          .fill(undefined)
          .map<ICell>((_, i) => ({
            position: [i, j],
          }))
      );
  }

  public place(id: Symbol, newPosition: Position): Array<ICell> {
    const changedCells = [];

    const oldPosition = this.objects.get(id);

    const [newX, newY] = newPosition;

    const newCell = this.cells[newY]?.[newX];

    if (newCell) {
      if (oldPosition) {
        const [oldX, oldY] = oldPosition;

        const oldCell = this.cells[oldY][oldX] as ICell;

        this.removeObject(oldCell, id);

        changedCells.push(oldCell);
      }

      let objects = newCell.objects ?? [];

      objects = objects.concat(id);

      newCell.objects = objects;

      this.objects.set(id, newPosition);

      changedCells.push(newCell);
    } else {
      throw new Error('');
    }

    return changedCells;
  }

  public where(id: Symbol): Position | undefined {
    return this.objects.get(id);
  }

  public getCells(
    [x, y]: Position,
    [width, height]: Dimensions,
    [xOrigin, yOrigin]: OriginType = ['center', 'center']
  ): Cells {
    const [mazeWidth, mazeHeight] = this.roomDimensions;
    const xBegin = this.getOriginPoint(x, mazeWidth, width, xOrigin);
    const yBegin = this.getOriginPoint(y, mazeHeight, height, yOrigin);

    return this.cells
      .slice(yBegin, yBegin + height)
      .map((row) => row.slice(xBegin, xBegin + width));
  }

  private removeObject(cell: ICell, object: Symbol): void {
    let objects = cell.objects ?? [];
    objects = objects.filter((o) => object !== o);

    if (objects.length === 0) {
      cell.objects = undefined;
    } else {
      cell.objects = objects;
    }
  }

  private getOriginPoint(
    n: number,
    length: number,
    dimension: number,
    placement: OriginPlacement
  ): number {
    switch (placement) {
      case 'start':
        return n;
      case 'center':
        const subtrahend = Math.floor(dimension / 2);
        return clamp(n - subtrahend, 0, length - dimension);
      case 'end':
        return Math.max(n - dimension, 0);
    }
  }
}
