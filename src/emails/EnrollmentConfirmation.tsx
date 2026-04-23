import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface EnrollmentConfirmationEmailProps {
  personName: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  location: string;
  duration: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export function EnrollmentConfirmationEmail({
  personName,
  courseName,
  courseDate,
  courseTime,
  location,
  duration,
}: EnrollmentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Påmeldingsbekreftelse — {courseName} hos KKS AS</Preview>
      <Body style={main}>
        <Container style={wrapper}>
          {/* Header with logo */}
          <Section style={header}>
            <Img
              src={`${BASE_URL}/logo-white-kks.png`}
              width="160"
              height="auto"
              alt="KKS AS"
              style={logo}
            />
          </Section>

          {/* Green confirmation banner */}
          <Section style={confirmBanner}>
            <Text style={confirmIcon}>&#10003;</Text>
            <Text style={confirmText}>Påmelding bekreftet</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hei {personName},</Text>

            <Text style={bodyText}>
              Takk for din påmelding! Vi gleder oss til å ha deg med på kurs.
              Under finner du alle detaljer om kurset ditt.
            </Text>

            {/* Course details card */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>Kursdetaljer</Text>

              <Row style={detailRow}>
                <Column style={detailLabel}>Kurs</Column>
                <Column style={detailValue}>{courseName}</Column>
              </Row>
              <Hr style={detailDivider} />

              <Row style={detailRow}>
                <Column style={detailLabel}>Dato</Column>
                <Column style={detailValue}>{courseDate}</Column>
              </Row>
              <Hr style={detailDivider} />

              <Row style={detailRow}>
                <Column style={detailLabel}>Tidspunkt</Column>
                <Column style={detailValue}>{courseTime}</Column>
              </Row>
              <Hr style={detailDivider} />

              <Row style={detailRow}>
                <Column style={detailLabel}>Sted</Column>
                <Column style={detailValue}>{location}</Column>
              </Row>
              <Hr style={detailDivider} />

              <Row style={detailRow}>
                <Column style={detailLabel}>Varighet</Column>
                <Column style={detailValue}>{duration}</Column>
              </Row>
            </Section>

            {/* What to bring */}
            <Heading as="h2" style={sectionHeading}>
              Hva du må ha med
            </Heading>

            <Section style={checklistCard}>
              <Row style={checklistItem}>
                <Column style={checkIcon}>&#9745;</Column>
                <Column style={checkText}>
                  <strong>Gyldig legitimasjon</strong>
                  <br />
                  <span style={checkSubtext}>
                    Førerkort, pass eller bankkort med bilde
                  </span>
                </Column>
              </Row>

              <Hr style={checklistDivider} />

              <Row style={checklistItem}>
                <Column style={checkIcon}>&#9745;</Column>
                <Column style={checkText}>
                  <strong>Behagelige arbeidsklær</strong>
                  <br />
                  <span style={checkSubtext}>
                    Klær som tåler praktisk arbeid — lange bukser og lukkede sko
                    (vernesko anbefales)
                  </span>
                </Column>
              </Row>

              <Hr style={checklistDivider} />

              <Row style={checklistItem}>
                <Column style={checkIcon}>&#9745;</Column>
                <Column style={checkText}>
                  <strong>Mat og drikke</strong>
                  <br />
                  <span style={checkSubtext}>
                    Ta med lunsj og drikke. Det finnes kjøpemuligheter i
                    nærheten.
                  </span>
                </Column>
              </Row>
            </Section>

            {/* Reminder info */}
            <Section style={reminderBox}>
              <Text style={reminderText}>
                Du vil motta en påminnelse 3 dager før kursstart.
              </Text>
            </Section>

            {/* Questions CTA */}
            <Text style={bodyText}>
              Har du spørsmål? Ikke nøl med å ta kontakt med oss — vi hjelper
              deg gjerne!
            </Text>

            <Section style={contactRow}>
              <Row>
                <Column style={contactItem}>
                  <Link href="tel:+4791540824" style={contactLink}>
                    +47 91 54 08 24
                  </Link>
                </Column>
                <Column style={contactItem}>
                  <Link href="mailto:post@kksas.no" style={contactLink}>
                    post@kksas.no
                  </Link>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Img
              src={`${BASE_URL}/logo-black-kks.png`}
              width="100"
              height="auto"
              alt="KKS AS"
              style={footerLogo}
            />
            <Text style={footerText}>
              Kurs og Kompetansesystemer AS
              <br />
              Org.nr: 925 897 019
              <br />
              Frøbergvegen 71, 2320 Furnes
            </Text>
            <Text style={footerLinks}>
              <Link href={`${BASE_URL}`} style={footerLink}>
                kksas.no
              </Link>
              {" · "}
              <Link href={`${BASE_URL}/personvern`} style={footerLink}>
                Personvern
              </Link>
              {" · "}
              <Link href={`${BASE_URL}/vilkar`} style={footerLink}>
                Vilkår
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EnrollmentConfirmationEmail;

const brandBlue = "#0e4fa8";
const brandBlueDark = "#0a3d82";

const main: React.CSSProperties = {
  backgroundColor: "#f0f4f8",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "20px 0",
};

const wrapper: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
};

const header: React.CSSProperties = {
  backgroundColor: brandBlue,
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  margin: "0 auto",
};

const confirmBanner: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  borderBottom: "1px solid #d1fae5",
  padding: "16px 40px",
  textAlign: "center" as const,
};

const confirmIcon: React.CSSProperties = {
  fontSize: "24px",
  color: "#059669",
  margin: "0 0 4px 0",
  lineHeight: "1",
};

const confirmText: React.CSSProperties = {
  color: "#065f46",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "0.5px",
};

const content: React.CSSProperties = {
  padding: "32px 40px",
};

const greeting: React.CSSProperties = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const bodyText: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "0 0 24px 0",
};

const detailsCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "24px",
  margin: "0 0 32px 0",
};

const detailsTitle: React.CSSProperties = {
  color: brandBlue,
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 20px 0",
};

const detailRow: React.CSSProperties = {
  width: "100%",
};

const detailLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  width: "110px",
  paddingTop: "10px",
  paddingBottom: "10px",
  verticalAlign: "top",
};

const detailValue: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  paddingTop: "10px",
  paddingBottom: "10px",
  verticalAlign: "top",
};

const detailDivider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const sectionHeading: React.CSSProperties = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 16px 0",
};

const checklistCard: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "10px",
  padding: "20px 24px",
  margin: "0 0 24px 0",
};

const checklistItem: React.CSSProperties = {
  width: "100%",
};

const checkIcon: React.CSSProperties = {
  color: brandBlue,
  fontSize: "20px",
  width: "32px",
  verticalAlign: "top",
  paddingTop: "8px",
};

const checkText: React.CSSProperties = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  paddingTop: "8px",
  paddingBottom: "8px",
};

const checkSubtext: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
};

const checklistDivider: React.CSSProperties = {
  borderColor: "#fde68a",
  margin: "4px 0",
};

const reminderBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  padding: "14px 20px",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const reminderText: React.CSSProperties = {
  color: "#1e40af",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const contactRow: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 8px 0",
};

const contactItem: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "0 12px",
};

const contactLink: React.CSSProperties = {
  color: brandBlue,
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
  padding: "28px 40px",
  textAlign: "center" as const,
};

const footerLogo: React.CSSProperties = {
  margin: "0 auto 12px auto",
  opacity: 0.7,
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
};

const footerLinks: React.CSSProperties = {
  margin: "0",
  fontSize: "12px",
};

const footerLink: React.CSSProperties = {
  color: brandBlueDark,
  textDecoration: "underline",
};
