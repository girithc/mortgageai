import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default function LoanDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Loan Details" />
      <main>
        <Container>{children}</Container>
      </main>
    </>
  );
}