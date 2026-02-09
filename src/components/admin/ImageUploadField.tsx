import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

const ImageUploadField = ({ value, onChange, label = "Product Image" }: ImageUploadFieldProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            onChange(data.secure_url);
            toast({
                title: "Success",
                description: "Image uploaded successfully to Cloudinary",
            });
        } catch (error: any) {
            console.error('Cloudinary upload error:', error);
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload image to Cloudinary. Please check your configuration.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            // Reset input so the same file can be uploaded again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-secondary font-medium">{label}</Label>
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 h-8 px-2"
                        onClick={() => onChange('')}
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="grid gap-4">
                {/* Preview Area */}
                <div className="relative group aspect-video rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                    {value ? (
                        <>
                            <img
                                src={value}
                                alt="Product preview"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Replace Image
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div
                            className="cursor-pointer flex flex-col items-center gap-2 p-6 text-center"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Click to upload product image</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG or WebP (max. 5MB)</p>
                            </div>
                        </div>
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm font-medium animate-pulse">Uploading to Cloudinary...</p>
                        </div>
                    )}
                </div>

                {/* URL Input */}
                <div className="space-y-1.5">
                    <Label htmlFor="image-url" className="text-xs text-muted-foreground">Or provide an external image URL</Label>
                    <div className="relative">
                        <Input
                            id="image-url"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="pr-10 focus-visible:ring-primary"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
};

export default ImageUploadField;
