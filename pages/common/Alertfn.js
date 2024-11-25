import { useToast } from "@chakra-ui/react";

export const useSuccessAlert = () => {
  const toast = useToast();
  return (message) => {
    toast({
      title: "Success",
      description: message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
};
export const useErrorAlert = () => {
  const toast = useToast();
  return (message) => {
    toast({
      title: "Error",
      description: message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };
};
