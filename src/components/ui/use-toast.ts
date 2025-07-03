
import { useToast, toast } from "@/hooks/use-toast";

// Configure toast with shorter duration and better positioning
const customToast = {
  ...toast,
  success: (message: string) => toast({
    title: "Success",
    description: message,
    duration: 2000, // 2 seconds
    className: "top-4 right-4 fixed z-50"
  }),
  error: (message: string) => toast({
    title: "Error", 
    description: message,
    variant: "destructive",
    duration: 2000, // 2 seconds
    className: "top-4 right-4 fixed z-50"
  })
};

export { useToast, customToast as toast };
