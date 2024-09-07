import ICell from '../models/cell.interface';
import Dimensions from '../models/dimensions.interface';
import OriginPlacement from '../models/origin-placement.model';
import OriginType from '../models/origin-type.model';
import Position from '../models/position.interface';
import clamp from '../utils/clamp.function';
import RoomConfig from './room.config';

export default class RoomData {
  protected width: number;
  protected height: number;

  protected roomDimensions: Dimensions;
  protected cells: Array<Array<ICell | undefined>>;
  public beginning: Position;
  protected objects: Map<Symbol, Position>;

  constructor({ height, width }: RoomConfig) {
    this.width = width;
    this.height = height;
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

    this.beginning = [0, 0];
  }

  public place(id: symbol, newPosition: Position): Array<ICell> {
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
    dimensions?: Dimensions,
    [xOrigin, yOrigin]: OriginType = ['center', 'center']
  ): Array<Array<ICell | undefined>> {
    const [mazeWidth, mazeHeight] = this.roomDimensions;
    let width: number, height: number, xBegin: number, yBegin: number;

    if (dimensions) {
      [width, height] = dimensions;
      xBegin = this.getOriginPoint(x, mazeWidth, width, xOrigin);
      yBegin = this.getOriginPoint(y, mazeHeight, height, yOrigin);
    } else {
      width = this.width;
      height = this.height;
      xBegin = 0;
      yBegin = 0;
    }

    const cells = this.cells
      .slice(yBegin, yBegin + height)
      .map((row) => row.slice(xBegin, xBegin + width));

    this.beginning = [xBegin, yBegin];

    return cells;
  }

  public removeCell(position: Position): void {
    const [x, y] = position;

    this.cells[y][x] = undefined;
  }

  public destroy(): void {
    this.cells.forEach((row) => (row.length = 0));
    this.cells.length = 0;
    this.objects.clear();
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
