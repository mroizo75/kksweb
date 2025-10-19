import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
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
      <Preview>Din påmelding til {courseName} er bekreftet</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Velkommen til {courseName}!</Heading>
          
          <Text style={text}>Hei {personName},</Text>
          
          <Text style={text}>
            Vi bekrefter at du er påmeldt følgende kurs:
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Kursdetaljer</Text>
            <Text style={infoText}>
              <strong>Kurs:</strong> {courseName}
            </Text>
            <Text style={infoText}>
              <strong>Dato:</strong> {courseDate}
            </Text>
            <Text style={infoText}>
              <strong>Tid:</strong> {courseTime}
            </Text>
            <Text style={infoText}>
              <strong>Sted:</strong> {location}
            </Text>
            <Text style={infoText}>
              <strong>Varighet:</strong> {duration}
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            Hva du må ta med:
          </Heading>
          <Text style={text}>
            • Gyldig legitimasjon (førerkort, pass eller bankkort med bilde)
            <br />
            • Undertøy og klær som ikke generer
            <br />
            • Mat og drikke (det er mulig å kjøpe i nærheten)
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            Du vil motta en påminnelse 3 dager før kursstart.
          </Text>

          <Text style={footer}>
            Med vennlig hilsen,
            <br />
            KKS AS
            <br />
            Telefon: [Telefonnummer]
            <br />
            E-post: kurs@kkskurs.no
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default EnrollmentConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 48px",
};

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "24px 0 16px",
  padding: "0 48px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 48px",
};

const infoBox = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "24px",
};

const infoTitle = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const infoText = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 48px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 48px",
  marginTop: "32px",
};

