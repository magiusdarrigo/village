export function getNumberFromQuery(queryParam: any): number | null {
  if (typeof queryParam === "string") {
    return parseInt(queryParam, 10);
  }
  return null;
}
