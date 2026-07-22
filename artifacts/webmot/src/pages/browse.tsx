import { useState } from "react";
import { useListQuotes, useListCategories } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, QuoteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Browse() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: quotes, isLoading: quotesLoading } = useListQuotes({ category });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-muted p-2 rounded-full transition-colors inline-flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-sans font-bold tracking-widest uppercase text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary glow-amber"></span>
              Webmot Library
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <h1 className="font-serif text-5xl sm:text-6xl font-medium tracking-tight text-foreground">
            Find your spark
          </h1>
          <p className="text-muted-foreground font-light max-w-2xl text-lg sm:text-xl">
            Browse our curated collection of wisdom. Filter by category to find exactly what you need today.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button
            onClick={() => setCategory(undefined)}
            className={cn("px-6 py-2.5 rounded-full text-sm font-medium transition-all border", !category ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-card text-card-foreground border-border hover:border-primary/50")}
          >
            All Quotes
          </button>
          {categories?.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn("px-6 py-2.5 rounded-full text-sm font-medium transition-all border flex items-center gap-2", category === c.slug ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-card text-card-foreground border-border hover:border-primary/50")}
            >
              {c.label} <span className={cn("text-xs px-2 py-0.5 rounded-full", category === c.slug ? "bg-primary-foreground/20" : "bg-muted")}>{c.count}</span>
            </button>
          ))}
          {categoriesLoading && (
            <>
              <Skeleton className="h-11 w-28 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
            </>
          )}
        </div>

        {/* Grid */}
        {quotesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />
            ))}
          </div>
        ) : quotes?.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <QuoteIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground">No quotes found in this category.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {quotes?.map((quote) => (
              <motion.div
                key={quote.id}
                variants={item}
                className="group relative flex flex-col bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)] hover:-translate-y-1"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img
                    src={quote.imageUrl}
                    alt={quote.imageAlt || quote.categoryLabel}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-foreground border-none px-3 py-1">
                      {quote.categoryLabel}
                    </Badge>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 relative">
                  <QuoteIcon className="absolute top-6 left-6 w-8 h-8 text-primary/10 -z-10" />
                  <p className="font-serif text-2xl leading-snug text-foreground mb-6 line-clamp-4 flex-1 font-medium">
                    "{quote.text}"
                  </p>
                  <p className="text-sm text-primary font-semibold uppercase tracking-wider">
                    — {quote.author}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}