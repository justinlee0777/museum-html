import styles from './player-sprite.module.css';
import PlayerSheet from './assets/player-sprite-sheet.png';

import { PlayerSprite } from '../index';
import {
  PlayerSpriteAction,
  PlayerSpriteArgs,
} from '../src/models/player-sprite.model';

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

export default class TestPlayerSprite implements PlayerSprite {
  sprite: HTMLCanvasElement | undefined;

  private lastPosture: SpritePosture | undefined;

  async draw(
    { cellSize }: PlayerSpriteArgs,
    action?: PlayerSpriteAction
  ): Promise<void> {
    if (action) {
      if (action.type === 'walk') {
        let postureSequence: Array<SpritePosture>;

        switch (action.direction) {
          case 'up':
            let upPose: SpritePosture;
            if (this.lastPosture === SpritePosture.RIGHT_FOOT_UP) {
              upPose = SpritePosture.LEFT_FOOT_UP;
            } else {
              upPose = SpritePosture.RIGHT_FOOT_UP;
            }

            this.lastPosture = upPose;
            postureSequence = [upPose, SpritePosture.UP_STANDING];
            break;

          case 'right':
            this.lastPosture = SpritePosture.RIGHT_WALKING;
            postureSequence = [
              SpritePosture.RIGHT_WALKING,
              SpritePosture.RIGHT_STANDING,
            ];
            break;

          case 'down':
            let downPose: SpritePosture;
            if (this.lastPosture === SpritePosture.RIGHT_FOOT_DOWN) {
              downPose = SpritePosture.LEFT_FOOT_DOWN;
            } else {
              downPose = SpritePosture.RIGHT_FOOT_DOWN;
            }

            this.lastPosture = downPose;
            postureSequence = [downPose, SpritePosture.DOWN_STANDING];
            break;

          case 'left':
            this.lastPosture = SpritePosture.LEFT_WALKING;
            postureSequence = [
              SpritePosture.LEFT_WALKING,
              SpritePosture.LEFT_STANDING,
            ];
            break;
        }

        const { animationTime } = action;

        const finalPose = postureSequence.pop()!;
        const slicedTime = animationTime / postureSequence.length;

        for (const posture of postureSequence) {
          this.drawSprite(posture, cellSize);

          await new Promise((resolve) => setTimeout(resolve, slicedTime));
        }

        this.drawSprite(finalPose, cellSize);
      }
    } else {
      this.drawSprite(SpritePosture.DOWN_STANDING, cellSize);
    }
  }

  private drawSprite(posture: SpritePosture, cellSize: number): void {
    const SPRITE_SIZE = 16;

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

  getDirection(): 'Up' | 'Right' | 'Down' | 'Left' {
    switch (this.lastPosture) {
      case undefined:
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
}
