import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Profile" />
      <main>
        <Container>{children}</Container>
      </main>
    </>
  );
}
