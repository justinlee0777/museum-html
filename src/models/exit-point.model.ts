import { Location } from './position.model';

export type ExitPoint<Data = void> = Location & {
  /**
   * Metadata associated to the exitpoint. Since rooms are unrelated to one another, you can use this as the glue
   * to connect rooms together.
   * For example, I use this to pack arbitrary data to figure out which room data to load, and where in the room
   * to initialize the player.
   */
  metadata: Data;
};
