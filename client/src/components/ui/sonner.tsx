import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        style: {
          background: "white",
          color: "#333",
          border: "1px solid #e5e7eb",
        },
      }}
    />
  );
};

export { Toaster };
