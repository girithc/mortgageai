import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Welcome To Mortgage AI" />
      <main>
        <Container>{children}</Container>
      </main>
    </>
  );
}
