export default interface DrawSprite {
  (
    image: HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    offsetX?: number,
    offsetY?: number
  ): void;
}
