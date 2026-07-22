import { useRef, useState } from "react"
import { Share2, Link as LinkIcon, Linkedin, Download, ImageIcon } from "lucide-react"
import { SiX, SiFacebook, SiWhatsapp } from "react-icons/si"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Quote } from "@workspace/api-client-react"
import { toast } from "sonner"

interface SharePanelProps {
  quote?: Quote;
}

async function generateQuoteImage(quote: Quote): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Try to load the background image with CORS
  let bgLoaded = false;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    // Unsplash supports CORS; append crossOrigin-friendly params
    const src = quote.imageUrl.includes("?")
      ? quote.imageUrl.replace(/w=\d+/, "w=1080").replace(/h=\d+/, "h=1080")
      : `${quote.imageUrl}?w=1080&h=1080&fit=crop&q=80`;
    await new Promise<void>((resolve) => {
      img.onload = () => { bgLoaded = true; resolve(); };
      img.onerror = () => resolve();
      img.src = src;
      setTimeout(resolve, 4000); // timeout fallback
    });
    if (bgLoaded) {
      // Draw image covering canvas
      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
    }
  } catch {
    bgLoaded = false;
  }

  if (!bgLoaded) {
    // Fallback: draw a lush gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0a1f0a");
    grad.addColorStop(0.5, "#0f2d1a");
    grad.addColorStop(1, "#071a10");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Dark gradient overlay — top to bottom
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0, "rgba(0,0,0,0.55)");
  overlay.addColorStop(0.4, "rgba(0,0,0,0.65)");
  overlay.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Category badge background
  const catText = quote.categoryLabel.toUpperCase();
  ctx.font = "bold 26px 'Georgia', serif";
  const catW = ctx.measureText(catText).width + 48;
  const catH = 44;
  const catX = (W - catW) / 2;
  const catY = 100;
  ctx.fillStyle = "rgba(34,197,94,0.18)";
  roundRect(ctx, catX, catY, catW, catH, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(34,197,94,0.6)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, catX, catY, catW, catH, 22);
  ctx.stroke();
  ctx.fillStyle = "#4ade80";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 22px 'Arial', sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(catText, W / 2, catY + catH / 2);

  // Large decorative opening quote mark
  ctx.fillStyle = "rgba(34,197,94,0.15)";
  ctx.font = "bold 240px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("\u201C", 40, 90);

  // Quote text — wrapped
  ctx.fillStyle = "#f5f5f0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = quote.text.length > 120 ? 46 : quote.text.length > 80 ? 54 : 62;
  ctx.font = `italic ${fontSize}px 'Georgia', serif`;
  const lineH = fontSize * 1.4;
  const lines = wrapText(ctx, `\u201C${quote.text}\u201D`, W - 120);
  const totalH = lines.length * lineH;
  const startY = (H - totalH) / 2 - 30;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineH);
  });

  // Divider line
  const divY = startY + totalH + 40;
  ctx.strokeStyle = "rgba(34,197,94,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, divY);
  ctx.lineTo(W / 2 + 60, divY);
  ctx.stroke();

  // Author
  ctx.fillStyle = "rgba(245,245,240,0.75)";
  ctx.font = "500 36px 'Arial', sans-serif";
  ctx.fillText(`\u2014 ${quote.author}`, W / 2, divY + 52);

  // Webmot branding at bottom
  ctx.fillStyle = "rgba(74,222,128,0.9)";
  ctx.beginPath();
  ctx.arc(70, H - 60, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(245,245,240,0.8)";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.letterSpacing = "4px";
  ctx.fillText("WEBMOT", 90, H - 56);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/png");
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function SharePanel({ quote }: SharePanelProps) {
  const [generatingImage, setGeneratingImage] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  if (!quote) return null;

  const shareText = `"${quote.text}" — ${quote.author}`;
  const currentUrl = window.location.origin;

  const getOrGenerateBlob = async (): Promise<Blob | null> => {
    if (blobRef.current) return blobRef.current;
    setGeneratingImage(true);
    try {
      const blob = await generateQuoteImage(quote);
      blobRef.current = blob;
      return blob;
    } catch {
      toast.error("Could not generate image");
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleNativeShareWithImage = async () => {
    const blob = await getOrGenerateBlob();
    if (!blob) return;
    const file = new File([blob], "webmot-quote.png", { type: "image/png" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Webmot Inspiration",
          text: shareText,
          url: currentUrl,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({ title: "Webmot Inspiration", text: shareText, url: currentUrl });
      } else {
        // Fallback: download image
        downloadBlob(blob);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") toast.error("Share failed");
    }
  };

  const handleDownloadImage = async () => {
    const blob = await getOrGenerateBlob();
    if (blob) downloadBlob(blob);
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webmot-${quote.category}-quote.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Image saved!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText} ${currentUrl}`);
    toast.success("Quote copied to clipboard");
  };

  const links = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
  };

  return (
    <Dialog onOpenChange={() => { blobRef.current = null; }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-14 w-14 backdrop-blur-md bg-background/20 border-foreground/20 hover:bg-background/40 text-foreground"
          data-testid="button-open-share"
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl font-medium">Share this spark</DialogTitle>
        </DialogHeader>

        {/* Image share actions */}
        <div className="flex gap-3 mt-2">
          <Button
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2"
            onClick={handleNativeShareWithImage}
            disabled={generatingImage}
            data-testid="button-share-image"
          >
            {generatingImage ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {generatingImage ? "Generating..." : "Share with Image"}
          </Button>
          <Button
            variant="outline"
            className="h-12 px-4 rounded-xl gap-2"
            onClick={handleDownloadImage}
            disabled={generatingImage}
            data-testid="button-download-image"
          >
            <Download className="w-4 h-4" />
            Save
          </Button>
        </div>

        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or share link</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social platform links */}
        <div className="grid grid-cols-4 gap-4 py-2">
          <a href={links.twitter} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group" data-testid="link-share-twitter">
            <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><SiX className="h-5 w-5" /></div>
            <span className="text-xs font-medium uppercase tracking-wider">X</span>
          </a>
          <a href={links.facebook} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group" data-testid="link-share-facebook">
            <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><SiFacebook className="h-5 w-5" /></div>
            <span className="text-xs font-medium uppercase tracking-wider">Facebook</span>
          </a>
          <a href={links.whatsapp} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group" data-testid="link-share-whatsapp">
            <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><SiWhatsapp className="h-5 w-5" /></div>
            <span className="text-xs font-medium uppercase tracking-wider">WhatsApp</span>
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group" data-testid="link-share-linkedin">
            <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><Linkedin className="h-5 w-5" /></div>
            <span className="text-xs font-medium uppercase tracking-wider">LinkedIn</span>
          </a>
        </div>

        <Button variant="secondary" className="w-full h-12 rounded-xl gap-2 mt-1" onClick={copyToClipboard} data-testid="button-copy-link">
          <LinkIcon className="w-4 h-4" /> Copy Quote
        </Button>
      </DialogContent>
    </Dialog>
  );
}
