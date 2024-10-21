import Position from './position.model';

interface CommonMuseumObject {
  origin: Position;
  width: number;
  height: number;
}

export interface LongPaintingMuseumObject extends CommonMuseumObject {
  sprite: 'long-painting';
}

type MuseumObject = LongPaintingMuseumObject;

export default MuseumObject;
