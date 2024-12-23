import { ExitPoint } from './exit-point.model';
import { MuseumObject } from './museum-object.model';
import { MuseumWall } from './museum-wall.model';
import { PlayerSprite } from './player-sprite.model';
import { Position } from './position.model';
import FrameRegistry from './registries/frame-registry.model';
import ObjectRegistry from './registries/object-registry.model';
import TileRegistry from './registries/tile-registry.model';
import WallRegistry from './registries/wall-registry.model';

export interface MuseumArgs<ExitPointData = void> {
  /**
   * Width of the museum in cells.
   */
  width: number;
  /**
   * Height of the museum in cells.
   */
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
    /** You must define this if you decide to use composite interactions i.e. @see CompositeMuseumObjectInteraction */
    frame?: FrameRegistry;
  };

  exitPoints?: Array<ExitPoint<ExitPointData>>;
}
