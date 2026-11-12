// The Trading & Derivatives department's next event (department brief, 12 Nov 2026), shared by the
// Newsroom card and the short pointer on the derivatives page. From NEXT_EVENT_UNTIL on (the
// visitor's clock) both drop it, so a past event never stays up as the "next" one. For the next
// event: replace public/assets/nextevent.jpg, update the Newsroom entry and these two values.
export const NEXT_EVENT_DATE = '26 November 2026'
export const NEXT_EVENT_UNTIL = '2026-11-27T00:00:00+01:00'

export const isUpcoming = (until?: string) => !until || Date.now() < Date.parse(until)
