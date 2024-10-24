import styles from './index.module.css';

import SPRITE_SIZE from '../../consts/sprite-size.const';
import MuseumArgs from '../../models/museum-args.model';
import PlayerSheet from '../../assets/player-sprite-sheet.png';
import ANIMATION_RATE from '../../consts/animate-rate.const';

export enum SpritePosture {
  RIGHT_FOOT_DOWN,
  DOWN_STANDING,
  LEFT_FOOT_DOWN,

  LEFT_FOOT_UP,
  UP_STANDING,
  RIGHT_FOOT_UP,

  LEFT_STANDING,
  LEFT_WALKING,

  RIGHT_STANDING,
  RIGHT_WALKING,
}

interface Args extends Pick<MuseumArgs, 'cellSize'> {}

export default class PlayerSprite {
  private lastPosture: SpritePosture | undefined;

  sprite: HTMLCanvasElement | undefined;

  constructor(private args: Args) {}

  draw(startingPosture: SpritePosture): void {
    this.drawSprite((this.lastPosture = startingPosture));
  }

  getDirection(): 'Up' | 'Right' | 'Down' | 'Left' {
    switch (this.lastPosture) {
      case undefined:
        throw new Error('Sprite not initialized with a posture.');
      case SpritePosture.RIGHT_FOOT_DOWN:
      case SpritePosture.DOWN_STANDING:
      case SpritePosture.LEFT_FOOT_DOWN:
        return 'Down';

      case SpritePosture.LEFT_FOOT_UP:
      case SpritePosture.UP_STANDING:
      case SpritePosture.RIGHT_FOOT_UP:
        return 'Up';

      case SpritePosture.LEFT_STANDING:
      case SpritePosture.LEFT_WALKING:
        return 'Left';

      case SpritePosture.RIGHT_STANDING:
      case SpritePosture.RIGHT_WALKING:
        return 'Right';
    }
  }

  async drawWalkingUp(): Promise<void> {
    let nextPose: SpritePosture;

    if (this.lastPosture === SpritePosture.RIGHT_FOOT_UP) {
      nextPose = SpritePosture.LEFT_FOOT_UP;
    } else {
      nextPose = SpritePosture.RIGHT_FOOT_UP;
    }

    this.lastPosture = nextPose;
    this.drawSprite(nextPose);

    await new Promise((resolve) => setTimeout(resolve, ANIMATION_RATE));

    this.drawSprite(SpritePosture.UP_STANDING);
  }

  async drawWalkingRight(): Promise<void> {
    const nextPose = (this.lastPosture = SpritePosture.RIGHT_WALKING);
    this.drawSprite(nextPose);

    await new Promise((resolve) => setTimeout(resolve, ANIMATION_RATE));

    this.drawSprite(SpritePosture.RIGHT_STANDING);
  }

  async drawWalkingDown(): Promise<void> {
    let nextPose: SpritePosture;
    if (this.lastPosture === SpritePosture.RIGHT_FOOT_DOWN) {
      nextPose = SpritePosture.LEFT_FOOT_DOWN;
    } else {
      nextPose = SpritePosture.RIGHT_FOOT_DOWN;
    }

    this.lastPosture = nextPose;
    this.drawSprite(nextPose);

    await new Promise((resolve) => setTimeout(resolve, ANIMATION_RATE));

    this.drawSprite(SpritePosture.DOWN_STANDING);
  }

  async drawWalkingLeft(): Promise<void> {
    const nextPose = (this.lastPosture = SpritePosture.LEFT_WALKING);
    this.drawSprite(nextPose);

    await new Promise((resolve) => setTimeout(resolve, ANIMATION_RATE));

    this.drawSprite(SpritePosture.LEFT_STANDING);
  }

  private drawSprite(posture: SpritePosture): void {
    const { cellSize } = this.args;

    let sprite = this.sprite;

    if (!sprite) {
      this.sprite = sprite = document.createElement('canvas');
      sprite.width = cellSize;
      sprite.height = cellSize;

      sprite.className = styles.playerSprite;
    }

    const image = new Image();

    image.onload = () => {
      const context = sprite!.getContext('2d')!;
      context.imageSmoothingEnabled = false;

      context.clearRect(0, 0, cellSize, cellSize);

      context.drawImage(
        image,
        posture * SPRITE_SIZE,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        0,
        0,
        cellSize,
        cellSize
      );
    };

    image.src = PlayerSheet;

    this.sprite = sprite;
  }
}
