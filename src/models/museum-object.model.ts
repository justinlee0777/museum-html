import Position from './position.model';

export default interface MuseumObject {
  origin: Position;
  width: number;
  height: number;
  sprite: string;
}
