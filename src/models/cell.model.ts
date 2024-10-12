export default interface Cell {
  position: [number, number];
  data?: {
    hasPlayer?: boolean;
  };
}
