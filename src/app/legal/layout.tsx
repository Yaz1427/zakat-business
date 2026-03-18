import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
