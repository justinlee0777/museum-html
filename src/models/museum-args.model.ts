import { MuseumObject } from './museum-object.model';
import { MuseumWall } from './museum-wall.model';
import Position from './position.model';
import ObjectRegistry from './registries/object-registry.model';
import TileRegistry from './registries/tile-registry.model';
import WallRegistry from './registries/wall-registry.model';

export default interface MuseumArgs {
  width: number;
  height: number;
  playerPosition: Position;
  cellSize: number;

  objects: Array<MuseumObject>;
  walls: Array<MuseumWall>;

  registries: {
    tile: TileRegistry;
    object: ObjectRegistry;
    wall: WallRegistry;
  };
}
