export default function padCenter(
  value: string,
  length: number,
  padString = ' '
): string {
  return value
    .padStart(value.length + Math.floor(length / 2), padString)
    .padEnd(length, padString);
}
