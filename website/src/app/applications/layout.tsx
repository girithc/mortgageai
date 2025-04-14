import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Mortgage Applications" />
      <main>
        <Container>{children}</Container>
      </main>
    </>
  );
}
