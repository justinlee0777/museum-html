import { ExitPoint } from './exit-point.model';
import { MuseumObject } from './museum-object.model';
import { MuseumWall } from './museum-wall.model';
import { PlayerSprite } from './player-sprite.model';
import { Position } from './position.model';
import ObjectRegistry from './registries/object-registry.model';
import TileRegistry from './registries/tile-registry.model';
import WallRegistry from './registries/wall-registry.model';

export interface MuseumArgs<ExitPointData = void> {
  width: number;
  height: number;
  playerPosition: Position;
  cellSize: number;

  objects: Array<MuseumObject>;
  walls: Array<MuseumWall>;

  registries: {
    player: PlayerSprite;
    tile: TileRegistry;
    object: ObjectRegistry;
    wall: WallRegistry;
  };

  exitPoints?: Array<ExitPoint<ExitPointData>>;
}
