import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/context/ProductContext';
import { Mail } from 'lucide-react';

const NewsletterPopup = () => {
    const { isNewsletterEnabled, subscribeToNewsletter } = useProducts();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // 1. Check if feature is enabled globally
        if (!isNewsletterEnabled) return;

        // 2. Check if user already dismissed it or subscribed
        const isDismissed = localStorage.getItem('newsletter_dismissed');
        if (isDismissed) return;

        // 3. Show after 5 seconds delay for better UX
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isNewsletterEnabled]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('newsletter_dismissed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        await subscribeToNewsletter(email);
        handleClose(); // Close and mark as done
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-serif text-secondary">Join the NanoEnrich Family</DialogTitle>
                    <DialogDescription>
                        Subscribe to our newsletter and get exclusive updates on new bamboo salt products and health tips.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-center"
                            required
                        />
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                            Subscribe Now
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        No spam, ever. Unsubscribe anytime.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NewsletterPopup;
