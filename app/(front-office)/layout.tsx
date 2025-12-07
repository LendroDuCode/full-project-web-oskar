// app/(front-office)/layout.tsx
import Header from "@/app/shared/components/layout/Header";
import Footer from "@/app/shared/components/layout/Footer";

export default function FrontOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-vh-100">{children}</main>
    </>
  );
}
