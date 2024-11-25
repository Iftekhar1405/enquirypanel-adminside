import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Dark Theme Configuration
const darkTheme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      100: "#ff6363",
      200: "#ff4d4d",
    },
    black: "#1a202c",
    white: "#f7fafc",
    gray: {
      50: "#f7fafc",
      100: "#edf2f7",
      200: "#e2e8f0",
      300: "#cbd5e0",
      400: "#a0aec0",
      500: "#718096",
      600: "#4a5568",
      700: "#2d3748",
      800: "#1a202c",
      900: "#171923",
    },
    red: {
      100: "#ff6363",
      200: "#ff4d4d",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.800",
        color: "white",
      },
      a: {
        color: "teal.200",
        _hover: {
          textDecoration: "underline",
        },
      },
      h1: {
        color: "white",
      },
    },
  },
  breakpoints: {
    print: "@media print",
  },
});

// Light Theme Configuration
const lightTheme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      100: "#ff6363",
      200: "#ff4d4d",
    },
    black: "#171923", // Dark text color for light theme
    white: "#ffffff", // Light background for the application
    gray: {
      50: "#f7fafc",
      100: "#edf2f7",
      200: "#e2e8f0",
      300: "#cbd5e0",
      400: "#a0aec0",
      500: "#718096",
      600: "#4a5568",
      700: "#2d3748",
      800: "#1a202c",
      900: "#171923",
    },
    red: {
      100: "#ff6363",
      200: "#ff4d4d",
    },
  },
  styles: {
    global: {
      body: {
        bg: "white", // Light background
        color: "black", // Black text color for better contrast
      },
      a: {
        color: "teal.500", // Teal color for links
        _hover: {
          textDecoration: "underline",
        },
      },
      h1: {
        color: "black",
      },
    },
  },
});

// React Query Client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  // Dynamically toggle theme if needed
  const theme = darkTheme; // Change to `lightTheme` to apply light mode

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
