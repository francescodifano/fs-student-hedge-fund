import type { ReactNode } from 'react'
import { usePageTitle } from '../lib/usePageTitle'

// Applications page, per External Relations' September 2026 request: one
// section per department with the role description supplied by that
// department, an Apply button under each, and the application window stated
// at the top. All buttons lead to the same central application form.
const APPLICATION_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSdwLjzEJsPbjL3TnHwqT40gPNvme8_fk339344UlO9laQaB7A/viewform?usp=dialog'

const TD_ROLES: [string, string, string][] = [
  ['Team Lead', 'All desks', 'Owns the portfolio as a whole. Makes final decisions on all trades and manages overall risk exposure across desks.'],
  ['Equities Associate', 'Equities', 'Reviews trade ideas from the Equities Analyst, assesses whether the thesis and derivative structure hold up, and passes a recommendation to the Team Lead.'],
  ['Equities Analyst', 'Equities', 'Generates equity trade ideas and proposes specific derivative structures to express them. Does not execute independently.'],
  ['FICC Associate', 'FI / FX / Commodities', 'Reviews trade ideas from the FICC Analyst, checks macro reasoning and instrument suitability, and passes a recommendation to the Team Lead.'],
  ['FICC Analyst', 'FI / FX / Commodities', 'Generates macro trade ideas across fixed income, FX, and commodities and proposes derivative structures to express them. Does not execute independently.'],
]

function ApplyButton() {
  return (
    <a
      href={APPLICATION_FORM}
      target="_blank"
      rel="noopener"
      className="mt-8 block w-full bg-navy px-10 py-4 text-center font-sans text-lg font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto sm:inline-block sm:px-14"
    >
      Apply
    </a>
  )
}

function DeptSection({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="container-page pt-14 md:pt-20">
      <h2 className="font-display text-h2 font-bold text-navy">{name}</h2>
      <div className="mt-5 h-px w-full bg-navy/15" />
      <div className="mt-7 max-w-4xl space-y-5 text-lead text-navy/85">{children}</div>
      <ApplyButton />
    </section>
  )
}

export default function Applications() {
  usePageTitle('Applications')

  return (
    <article className="pb-16 md:pb-24">
      <section className="container-page pt-12 md:pt-16">
        <h1 className="font-display text-display font-bold text-navy">Applications</h1>
        <p className="mt-6 max-w-3xl text-lead text-navy/85">
          Applications for the FS Student Hedge Fund are open now until 13 September 2026. Choose the department that
          fits you best and apply through the form below.
        </p>
      </section>

      <DeptSection name="Trading & Derivatives">
        <p>Each team consists of five members in the following roles:</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-navy/20">
                <th scope="col" className="py-3 pr-4 font-sans text-sm font-extrabold text-navy">Role</th>
                <th scope="col" className="py-3 pr-4 font-sans text-sm font-extrabold text-navy">Desk</th>
                <th scope="col" className="py-3 font-sans text-sm font-extrabold text-navy">Scope</th>
              </tr>
            </thead>
            <tbody>
              {TD_ROLES.map(([role, desk, scope], i) => (
                <tr key={role} className={i > 0 ? 'border-t border-navy/10' : ''}>
                  <th scope="row" className="py-3 pr-4 align-top text-sm font-semibold text-navy whitespace-nowrap">{role}</th>
                  <td className="py-3 pr-4 align-top text-sm text-navy/85 whitespace-nowrap">{desk}</td>
                  <td className="py-3 align-top text-sm text-navy/85">{scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DeptSection>

      <DeptSection name="Index Construction">
        <p>
          As an Analyst, you screen global markets, macroeconomic developments, and emerging trends to build a strong
          understanding of the market environment. As part of the team, you contribute to developing our own tradable
          financial product with our industry partners, while top performers can progress into our Asset Selection
          team, take on leadership roles, or use the program as a stepping stone into the Hedge Fund Department.
        </p>
      </DeptSection>

      <DeptSection name="Hedge Fund">
        <p>
          The Hedge Fund department builds and maintains its own portfolio, and it publishes the written research
          behind every position it holds.
        </p>
      </DeptSection>

      <DeptSection name="Quantitative Team">
        <p>
          In the Quantitative Department, we build and test automated trading strategies across all asset classes
          using paper trading accounts to bring ideas to life. We also work closely together with other departments
          and help them develop the tools and infrastructure that power analysis across the entire FS Hedge Fund
          initiative. Additionally we help our members break into quantitative finance through dedicated interview
          preparation and industry insights.
        </p>
      </DeptSection>

      <DeptSection name="Marketing & External Relations">
        <div>
          <h3 className="font-sans text-xl font-extrabold text-navy">Marketing</h3>
          <p className="mt-3">
            In the Marketing team you will help shape how the FS Student Hedge Fund presents itself both on campus and
            beyond. You will work creatively to strengthen our brand, market events and kick-offs, and develop
            engaging content across LinkedIn and Instagram. The role offers the opportunity to contribute your own
            ideas, build our digital presence, and help grow awareness of the fund within the Frankfurt School
            community and wider network.
          </p>
        </div>
        <div>
          <h3 className="font-sans text-xl font-extrabold text-navy">External Relations, Operations &amp; Coordination</h3>
          <p className="mt-3">
            The Operations &amp; Coordination team supports the smooth execution of the initiative's external
            activities. Responsibilities include managing event attendance, coordinating interviews and meetings,
            handling email communication, tracking upcoming events and deadlines, and providing general organisational
            support to the External Affairs department. The role is ideal for organised, reliable, and proactive
            members who enjoy keeping projects and communication running efficiently.
          </p>
        </div>
      </DeptSection>
    </article>
  )
}
