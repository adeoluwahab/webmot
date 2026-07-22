import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground text-center p-6">
      <h1 className="font-serif text-8xl font-bold mb-6 text-primary glow-emerald inline-block rounded-full px-8 py-2">404</h1>
      <p className="text-2xl text-muted-foreground mb-8 font-light">This page got lost in the wind.</p>
      <Button asChild size="lg" className="rounded-full px-8">
        <Link href="/">Return to Inspiration</Link>
      </Button>
    </div>
  );
}