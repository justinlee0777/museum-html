import ObjectRegistry from './registries/object-registry.model';
import TileRegistry from './registries/tile-registry.model';
import WallRegistry from './registries/wall-registry.model';

import Cell from './cell.model';
import { MuseumArgs } from './museum-args.model';
import {
  MuseumObject,
  MuseumObjectInteraction,
  TextMusemObjectInteraction,
} from './museum-object.model';
import { MuseumWall, MuseumWallType } from './museum-wall.model';
import {
  PlayerSprite,
  PlayerSpriteAction,
  PlayerSpriteArgs,
} from './player-sprite.model';
import { Position } from './position.model';
import { ExitPoint } from './exit-point.model';
import { OnExit } from './callbacks.model';

export {
  ObjectRegistry,
  TileRegistry,
  WallRegistry,
  Cell,
  MuseumArgs,
  MuseumObject,
  MuseumObjectInteraction,
  TextMusemObjectInteraction,
  MuseumWall,
  MuseumWallType,
  PlayerSprite,
  PlayerSpriteAction,
  PlayerSpriteArgs,
  Position,
  ExitPoint,
  OnExit,
};
