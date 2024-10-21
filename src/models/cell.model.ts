import MuseumObject from './museum-object.model';

export default interface Cell {
  position: [number, number];
  data?: {
    hasPlayer?: boolean;
    object?: MuseumObject;
  };
}
