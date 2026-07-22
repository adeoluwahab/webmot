import { useState } from "react";
import { useGetRandomQuote, useListCategories } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { SharePanel } from "@/components/share-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuoteIcon } from "lucide-react";

export default function Home() {
  const [category, setCategory] = useState<string | undefined>();

  const { data: quote, isFetching, refetch } = useGetRandomQuote(
    category ? { category } : {},
    { query: { staleTime: Infinity, refetchOnWindowFocus: false } }
  );

  const { data: categories } = useListCategories();

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col bg-background">
       {/* Background Layer */}
       <AnimatePresence mode="wait" initial={false}>
         {quote ? (
           <motion.img
             key={quote.imageUrl}
             src={quote.imageUrl}
             alt={quote.imageAlt || "Inspirational background"}
             className="absolute inset-0 w-full h-full object-cover z-0"
             initial={{ opacity: 0, scale: 1.05 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1.2, ease: "easeOut" }}
           />
         ) : null}
       </AnimatePresence>

       {/* Gradient Overlay for Text Contrast & Blending */}
       <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background z-10 transition-colors duration-700 pointer-events-none" />

       {/* Header */}
       <header className="relative z-20 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="font-sans font-bold tracking-widest uppercase text-sm flex items-center gap-3 text-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-primary glow-emerald"></span>
            Webmot
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
             <Link href="/browse" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
               Browse Library
             </Link>
             <ThemeToggle />
          </nav>
       </header>

       {/* Main Quote Content */}
       <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center w-full max-w-5xl mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            {isFetching && !quote ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-muted-foreground font-sans tracking-widest uppercase text-sm font-medium">
                  Finding meaning...
                </p>
              </motion.div>
            ) : quote ? (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="space-y-10 w-full"
              >
                 <Badge variant="outline" className="text-foreground border-foreground/20 backdrop-blur-md px-4 py-1.5 text-xs tracking-wider uppercase bg-background/30">
                   {quote.categoryLabel}
                 </Badge>

                 <div className="relative">
                   <QuoteIcon className="absolute -top-8 -left-8 sm:-top-12 sm:-left-12 w-16 h-16 sm:w-24 sm:h-24 text-primary/20 rotate-180 -z-10" />
                   <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.15] drop-shadow-sm font-medium">
                     "{quote.text}"
                   </h1>
                   <QuoteIcon className="absolute -bottom-8 -right-8 sm:-bottom-12 sm:-right-12 w-16 h-16 sm:w-24 sm:h-24 text-primary/20 -z-10" />
                 </div>

                 <p className="font-sans text-xl sm:text-2xl text-foreground/80 font-light tracking-wide uppercase">
                   — {quote.author}
                 </p>
              </motion.div>
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-foreground/60"
              >
                Could not fetch a quote right now.
              </motion.div>
            )}
          </AnimatePresence>
       </main>

       {/* Footer Controls */}
       <footer className="relative z-20 p-6 pb-10 sm:pb-12 sm:p-12 w-full max-w-7xl mx-auto flex flex-col items-center gap-10">
          {/* Category Pills */}
          <div className="flex overflow-x-auto no-scrollbar w-full max-w-3xl justify-start sm:justify-center gap-3 px-4 snap-x">
             <button
               onClick={() => setCategory(undefined)}
               className={cn(
                 "snap-center whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border",
                 !category ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-background/40 text-foreground border-foreground/20 hover:bg-background/60"
               )}
             >
               All Quotes
             </button>
             {categories?.map((c) => (
               <button
                 key={c.slug}
                 onClick={() => setCategory(c.slug)}
                 className={cn(
                   "snap-center whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border",
                   category === c.slug ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-background/40 text-foreground border-foreground/20 hover:bg-background/60"
                 )}
               >
                 {c.label}
               </button>
             ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 w-full">
            <SharePanel quote={quote} />
            <Button
              size="lg"
              className="rounded-full px-8 sm:px-12 h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all hover:scale-105"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-next-quote"
            >
               {isFetching ? "Turning page..." : "Next Quote"}
            </Button>
          </div>
       </footer>
    </div>
  );
}