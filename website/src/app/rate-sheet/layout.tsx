import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default function RateSheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Rate Sheet" />
      <main>
        <Container>{children}</Container>
      </main>
    </>
  );
}
