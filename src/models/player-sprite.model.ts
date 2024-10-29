import MuseumArgs from './museum-args.model';

export interface WalkingPlayerSpriteAction {
  direction: 'up' | 'right' | 'down' | 'left';
  /**
   * The time in which the animation must finish.
   */
  animationTime: number;
  type: 'walk';
}

export type PlayerSpriteAction = WalkingPlayerSpriteAction;

export interface PlayerSpriteArgs extends Pick<MuseumArgs, 'cellSize'> {}

export interface PlayerSprite {
  /** Needs to be defined after 'draw' is called. */
  sprite: HTMLElement | undefined;

  draw(args: PlayerSpriteArgs, action?: PlayerSpriteAction): Promise<void>;

  getDirection(): 'Up' | 'Right' | 'Down' | 'Left';
}
