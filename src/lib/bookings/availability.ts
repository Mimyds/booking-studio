export type UnavailableRange = { from: string; to: string }

// A stay occupies its arrival date through the day before departure.
export function isUnavailableDay(date: string, ranges: UnavailableRange[]) {
  return ranges.some((range) => range.from <= date && date < range.to)
}

export function isStayAvailable(checkIn: string, checkOut: string, ranges: UnavailableRange[]) {
  return ranges.every((range) => checkOut <= range.from || checkIn >= range.to)
}

// Departure on the first blocked day is allowed; staying past it is not.
export function latestCheckoutBeforeBlock(checkIn: string, ranges: UnavailableRange[]) {
  return ranges
    .filter((range) => range.from > checkIn)
    .reduce<string | undefined>((closest, range) =>
      closest === undefined || range.from < closest ? range.from : closest, undefined)
}
