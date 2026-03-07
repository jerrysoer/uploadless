import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Developer & Privacy Tools — ShipLocal",
  description:
    "18 developer and 7 privacy tools that run entirely in your browser. Hash, encode, encrypt, generate, diff, inspect — no uploads, no tracking.",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
      <Footer />
    </>
  );
}
