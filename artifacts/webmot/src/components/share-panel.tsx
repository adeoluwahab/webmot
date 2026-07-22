import { Share2, Link as LinkIcon, Linkedin } from "lucide-react"
import { SiX, SiFacebook, SiWhatsapp } from "react-icons/si"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Quote } from "@workspace/api-client-react"
import { toast } from "sonner"

export function SharePanel({ quote }: { quote?: Quote }) {
  if (!quote) return null;

  const shareText = `"${quote.text}" — ${quote.author}`;
  const currentUrl = window.location.origin;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Webmot Inspiration',
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText} ${currentUrl}`);
    toast.success("Link copied to clipboard");
  }

  const links = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  };

  return (
    <Dialog>
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
        <div className="grid grid-cols-4 gap-4 py-8">
           <a href={links.twitter} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group">
             <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><SiX className="h-6 w-6" /></div>
             <span className="text-xs font-medium uppercase tracking-wider">X</span>
           </a>
           <a href={links.facebook} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group">
             <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><SiFacebook className="h-6 w-6" /></div>
             <span className="text-xs font-medium uppercase tracking-wider">Facebook</span>
           </a>
           <a href={links.whatsapp} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group">
             <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><SiWhatsapp className="h-6 w-6" /></div>
             <span className="text-xs font-medium uppercase tracking-wider">WhatsApp</span>
           </a>
           <a href={links.linkedin} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 hover:text-primary transition-colors group">
             <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><Linkedin className="h-6 w-6" /></div>
             <span className="text-xs font-medium uppercase tracking-wider">LinkedIn</span>
           </a>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          {navigator.share && (
            <Button className="w-full sm:flex-1 h-12 rounded-xl" onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share via device
            </Button>
          )}
          <Button variant="secondary" className="w-full sm:flex-1 h-12 rounded-xl" onClick={copyToClipboard}>
            <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}