import { toast as sonnerToast } from "sonner";

export const toast = (options: { title?: string; description?: string; variant?: string }) => {
  if (options.variant === "destructive") {
    return sonnerToast.error(options.title || "Error", {
      description: options.description,
    });
  }
  return sonnerToast.success(options.title || "Success", {
    description: options.description,
  });
};

export const useToast = () => {
  return {
    toast: (options: { title?: string; description?: string; variant?: string }) => {
      if (options.variant === "destructive") {
        return sonnerToast.error(options.title || "Error", {
          description: options.description,
        });
      }
      return sonnerToast.success(options.title || "Success", {
        description: options.description,
      });
    },
    toasts: [],
  };
};
