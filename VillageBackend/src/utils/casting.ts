export function getNumberFromQuery(queryParam: any): number | null {
  if (typeof queryParam === "string") {
    return parseInt(queryParam, 10);
  }
  return null;
}

export function getBooleanFromQuery(queryParam: any): boolean {
  if (typeof queryParam === "string") {
    return queryParam === "true";
  }
  // default to false
  return false;
}
