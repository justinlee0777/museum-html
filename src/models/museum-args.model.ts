import MuseumObject from './museum-object.model';
import { MuseumWall } from './museum-wall.model';
import Position from './position.model';

export default interface MuseumArgs {
  width: number;
  height: number;
  playerPosition: Position;
  cellSize: number;

  objects: Array<MuseumObject>;
  walls: Array<MuseumWall>;
}
