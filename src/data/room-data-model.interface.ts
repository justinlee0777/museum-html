import ICell from '../models/cell.interface';

export default interface RoomDataModel<CellData = void> {
  cells: Array<Array<ICell<CellData> | undefined>>;
}
