import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:bg-[#fdf0e3] group-[.toaster]:text-[#660e14] group-[.toaster]:border-[#660e1415] group-[.toaster]:rounded-[28px] group-[.toaster]:shadow-[0_20px_50px_rgba(102,14,20,0.15)] group-[.toaster]:p-6",
          title: "group-[.toast]:font-normal group-[.toast]:text-2xl group-[.toast]:leading-none group-[.toast]:mb-1",
          description: "group-[.toast]:text-[10px] group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:tracking-[0.2em] group-[.toast]:text-[#660e14] group-[.toast]:opacity-70",
          actionButton: "group-[.toast]:bg-[#660e14] group-[.toast]:text-[#fdf0e3] group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:text-[9px] group-[.toast]:tracking-widest group-[.toast]:rounded-xl h-9 px-4",
        },
      }}
      style={
        {
          "--normal-bg": "#fdf0e3",
          "--normal-text": "#660e14",
          "--normal-border": "#660e1420",
          "--success-bg": "#660e14",
          "--success-text": "#fdf0e3",
          "--error-bg": "#ad2335",
          "--error-text": "#ffffff",
          "boxShadow": "0 10px 30px rgba(102, 14, 20, 0.15)",
          "borderRadius": "20px"
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
