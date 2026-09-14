// The address every Contact button opens. fs-student-hedge-fund@fs-studentinitiatives.de is the
// fund's Microsoft 365 mailbox (MX -> outlook.com, in use July 2026). Do not use
// info@fs-student-hedgefund.com here: that domain has no MX record and receives nothing.
export const CONTACT_EMAIL = 'fs-student-hedge-fund@fs-studentinitiatives.de'
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`
// Split for display, so a narrow column breaks the address after the @ and never at a hyphen.
export const [CONTACT_EMAIL_LOCAL, CONTACT_EMAIL_DOMAIN] = CONTACT_EMAIL.split('@')
