import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Mobile-optimized position (bottom-center usually feels less intrusive on mobile)
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-xl md:rounded-lg p-3 md:p-4 gap-2 md:gap-3 text-xs md:text-sm font-medium border w-[90vw] md:w-auto mx-auto",
          description: "group-[.toast]:text-muted-foreground text-[10px] md:text-xs leading-tight",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs px-3 py-1.5 h-auto",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs px-3 py-1.5 h-auto",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
