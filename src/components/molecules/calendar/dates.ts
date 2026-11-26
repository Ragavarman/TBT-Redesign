/* Dates are plain "YYYY-MM-DD" strings, calculated in UTC so a day never shifts with the
   viewer's time zone. */

export const DAY = 86_400_000
export const toTime = (d: string) => Date.parse(`${d}T00:00:00Z`)
export const toDate = (t: number) => new Date(t).toISOString().slice(0, 10)
export const addDays = (d: string, n: number) => toDate(toTime(d) + n * DAY)
export const monthOf = (d: string) => d.slice(0, 7)
export const addMonths = (month: string, n: number) => {
  const [y, m] = month.split('-').map(Number) as [number, number]
  return toDate(Date.UTC(y, m - 1 + n, 1)).slice(0, 7)
}
/** Monday = 0 … Sunday = 6. */
export const weekday = (d: string) => (new Date(toTime(d)).getUTCDay() + 6) % 7
/** Today in UTC. */
export const todayUTC = () => toDate(Date.now())
