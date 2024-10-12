import styles from './index.module.css';

import SPRITE_SIZE from '../../consts/sprite-size.const';
import MuseumArgs from '../../models/museum-args.model';
import PlayerSheet from '../../assets/player-sprite-sheet.png';

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

interface Args extends Pick<MuseumArgs, 'cellSize'> {
  posture: SpritePosture;
}

export default function drawPlayerSprite({
  cellSize,
  posture,
}: Args): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = cellSize;
  sprite.height = cellSize;

  sprite.className = styles.playerSprite;

  const image = new Image();

  image.onload = () => {
    const context = sprite.getContext('2d')!;
    context.imageSmoothingEnabled = false;

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

  return sprite;
}
