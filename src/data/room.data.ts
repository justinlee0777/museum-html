import ICell from '../models/cell.interface';
import Dimensions from '../models/dimensions.interface';
import OriginPlacement from '../models/origin-placement.model';
import OriginType from '../models/origin-type.model';
import Position from '../models/position.interface';
import clamp from '../utils/clamp.function';
import RoomDataModel from './room-data-model.interface';
import RoomConfig from './room.config';

export default class RoomData<CellData = void> {
  protected width: number;
  protected height: number;

  protected roomDimensions: Dimensions;
  protected cells: Array<Array<ICell<CellData> | undefined>>;
  public beginning: Position;

  constructor({ height, width }: RoomConfig) {
    this.width = width;
    this.height = height;
    this.roomDimensions = [width, height];

    this.cells = Array(height)
      .fill(undefined)
      .map((_, j) =>
        Array(width)
          .fill(undefined)
          .map((_, i) => ({
            position: [i, j],
          }))
      );

    this.beginning = [0, 0];
  }

  public getSubset(
    [x, y]: Position,
    dimensions?: Dimensions,
    [xOrigin, yOrigin]: OriginType = ['center', 'center']
  ): Array<Array<ICell<CellData> | undefined>> {
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

  public updateCell([x, y]: Position, cellData: CellData): void {
    this.cells[y][x]!.data = cellData;
  }

  public removeCell(position: Position): void {
    const [x, y] = position;

    this.cells[y][x] = undefined;
  }

  public destroy(): void {
    this.cells.forEach((row) => (row.length = 0));
    this.cells.length = 0;
  }

  /*
  toJSON(): RoomDataModel {

  }
  */

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
