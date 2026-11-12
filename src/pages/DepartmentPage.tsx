import { asset as A } from '../lib/asset'
import { DEPARTMENTS_DATA } from '../lib/departments'
import { usePageTitle } from '../lib/usePageTitle'
import { MissionBand, DeptLeads, OtherDepartments, JoinCta } from '../components/DeptSections'
import DerivativesExtras from '../components/DerivativesExtras'

// Shared, responsive template for the department pages: image hero with a navy
// name band → About → mission statement → department leads → cross-nav → CTA.
export default function DepartmentPage({ slug }: { slug: string }) {
  const d = DEPARTMENTS_DATA[slug]
  usePageTitle(d.name)

  return (
    <article>
      <section className="relative">
        <img
          src={A(d.hero)}
          alt=""
          className="h-[48vw] max-h-[520px] min-h-[240px] w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy/10" />
        {/* Name band: left-aligned with the content grid, straddling the image's
            bottom edge (half over the photo, half over the white area) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="container-page">
            <h1 className="inline-block bg-navy px-8 py-5 font-display text-h1 font-bold text-white sm:px-12 sm:py-6">{d.name}</h1>
          </div>
        </div>
      </section>

      <section className="container-page pt-28 pb-16 md:pt-36 md:pb-24">
        <h2 className="font-display text-h1 font-bold text-navy">About</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <div className="mt-8 space-y-5 text-lead text-navy/85">
          {d.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Trading & Derivatives only: flip cards, next-event pointer, workshop gallery (brief of 12 Nov 2026) */}
      {slug === 'derivatives' && <DerivativesExtras />}

      <MissionBand>{d.mission}</MissionBand>
      <DeptLeads names={d.leads} />
      <OtherDepartments current={`/${slug}`} />
      <JoinCta dept={d.name} />
    </article>
  )
}
