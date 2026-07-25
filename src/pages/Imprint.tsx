import Container from '../components/Container'
import { usePageTitle } from '../lib/usePageTitle'

// Legal page requested by the team (meeting of 25 Jul 2026): an imprint plus
// disclaimers, modeled on FS Entrepreneurship's imprint. The research
// disclaimer matters most, since the fund publishes research on this site.
export default function Imprint() {
  usePageTitle('Imprint & Disclaimer')
  return (
    <>
      <section className="container-page pt-12 pb-10 md:pt-16 md:pb-14">
        <h1 className="font-display text-display font-bold text-navy">Imprint &amp; Disclaimer</h1>
      </section>

      <section className="bg-mist py-14 md:py-20">
        <Container>
          <div className="max-w-3xl space-y-12 text-navy/85">
            <Block title="Information in accordance with § 5 TMG">
              <p>
                FS Student Hedge Fund
                <br />
                Student initiative at Frankfurt School of Finance &amp; Management
                <br />
                Adickesallee 32-34
                <br />
                60322 Frankfurt am Main, Germany
              </p>
              <p className="mt-4">
                Email:{' '}
                <a href="mailto:info@fs-student-hedgefund.com" className="font-semibold text-navy underline decoration-navy/30 underline-offset-2 hover:decoration-navy">
                  info@fs-student-hedgefund.com
                </a>
              </p>
              <p className="mt-4">
                FS Student Hedge Fund is a non-commercial student initiative. It is not a legal entity, not a
                registered investment company, and not supervised by any financial regulatory authority.
              </p>
            </Block>

            <Block title="Responsible for content">
              <p>
                The leadership team of FS Student Hedge Fund, care of the address above. Inquiries about any content
                on this website can be directed to the email address above and will be forwarded to the responsible
                department.
              </p>
            </Block>

            <Block title="No investment advice">
              <p>
                All content on this website, including the published research papers and reports, is prepared by
                students for educational purposes only. It does not constitute investment advice, a recommendation,
                a solicitation, or an offer to buy or sell any security or financial instrument. The analyses
                reflect the personal views of their student authors at the time of writing, may contain errors, and
                must not be relied upon for investment decisions. Past or simulated performance is not a reliable
                indicator of future results. Anyone considering an investment should consult a licensed financial
                advisor.
              </p>
            </Block>

            <Block title="Liability for content">
              <p>
                The contents of this website were created with the greatest possible care. However, we accept no
                responsibility for the topicality, correctness, completeness, or quality of the information
                provided. Liability claims arising from the use or non-use of the information presented, or from
                the use of incorrect or incomplete information, are excluded unless caused by intentional
                misconduct or gross negligence.
              </p>
            </Block>

            <Block title="Liability for links">
              <p>
                This website contains links to external third-party websites over whose content we have no
                influence. We therefore accept no liability for such external content; the respective provider or
                operator of the linked pages is always responsible for their content. The linked pages were checked
                for possible legal violations at the time of linking. Should we become aware of any infringement,
                we will remove the affected link without delay.
              </p>
            </Block>

            <Block title="Copyright">
              <p>
                The content and works created by FS Student Hedge Fund on this website are protected by copyright.
                Reproduction, editing, distribution, or any use beyond the limits of copyright law requires our
                prior written consent. Trademarks and brand names mentioned on this website, including those of
                companies covered in our research, remain the property of their respective owners and are used for
                identification purposes only.
              </p>
            </Block>
          </div>
        </Container>
      </section>
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-h3 font-bold text-navy">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </div>
  )
}
