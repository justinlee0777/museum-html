import Position from './position.model';

export default interface MuseumArgs {
  width: number;
  height: number;
  playerPosition: Position;
  cellSize: number;
}
