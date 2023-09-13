export default function paintPlayer(size: number): HTMLElement {
  const sprite = document.createElement('div');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  sprite.appendChild(canvas);

  const context = canvas.getContext('2d');

  if (context) {
    context.fillStyle = 'red';
    context.fillRect(0, 0, 10, 10);

    context.fillStyle = 'blue';
    context.fillRect(10, 0, 10, 10);

    context.fillStyle = 'green';
    context.fillRect(0, 10, 10, 10);
  }
  return sprite;
}
