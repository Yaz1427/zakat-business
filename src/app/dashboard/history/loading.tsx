import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border/60 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

export default function HistoryLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] dark:bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-card rounded-xl border border-border/60 p-4 flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        <Skeleton className="h-3.5 w-28 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
