import { useState, type FormEvent } from 'react'
import { asset as A } from '../lib/asset'
import Container from '../components/Container'
import Button from '../components/Button'
import { usePageTitle } from '../lib/usePageTitle'
import { CONTACT_EMAIL } from '../lib/contact'

const field = 'w-full border-0 border-b-2 border-navy/40 bg-transparent px-0 py-2 font-sans text-navy outline-none transition-colors focus:border-navy'

// Contact: the form composes an email in the visitor's mail client (no backend
// needed), so the page is genuinely usable at launch.
export default function Contact() {
  usePageTitle('Contact')
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Website contact from ${first} ${last}`.trim())
    const body = encodeURIComponent(`${message}\n\nName: ${first} ${last}\nEmail: ${email}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <Container className="py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="font-display text-h1 font-bold text-navy">Contact us</h1>
          <form className="mt-10 space-y-8" onSubmit={submit}>
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="text-navy">First Name *</span>
                <input type="text" required value={first} onChange={(e) => setFirst(e.target.value)} className={`mt-2 ${field}`} />
              </label>
              <label className="block">
                <span className="text-navy">Last Name *</span>
                <input type="text" required value={last} onChange={(e) => setLast(e.target.value)} className={`mt-2 ${field}`} />
              </label>
            </div>
            <label className="block">
              <span className="text-navy">Email *</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${field}`} />
            </label>
            <label className="block">
              <span className="text-navy">Write a message</span>
              <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={`mt-2 resize-none ${field}`} />
            </label>
            <Button type="submit" className="w-full sm:w-auto">Submit</Button>
            <p className="text-sm text-navy/60">
              Submitting opens your email app with the message ready to send. You can also write to us directly at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-navy">{CONTACT_EMAIL}</a>.
            </p>
          </form>
        </div>

        {/* Image follows the heading/form on mobile (title leads the page), sits right on desktop.
            self-start keeps the mist shadow hugging the image instead of the grid row height */}
        <div className="relative self-start">
          <div className="absolute -bottom-2 -left-2 h-full w-full bg-mist sm:-bottom-3 sm:-left-3" aria-hidden />
          <img
            src={A('contact-mountain.jpg')}
            alt="Snow-capped mountain at sunset"
            className="relative aspect-square w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </Container>
  )
}
