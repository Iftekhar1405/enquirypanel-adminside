import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { extendTheme } from "@chakra-ui/react";

// Define the colors for the dark theme
const darkTheme = extendTheme({
    config: {
        initialColorMode: "dark", // Set the initial color mode to dark
        useSystemColorMode: false, // Disable using system color mode
    },
    colors: {
        brand: {
            100: "#ff6363", // A shade of red for brand color
            200: "#ff4d4d",
        },
        black: "#1a202c", // Dark background for the application
        white: "#f7fafc", // Light text and icons
        gray: {
            50: "#f7fafc",
            100: "#edf2f7",
            200: "#e2e8f0",
            300: "#cbd5e0",
            400: "#a0aec0",
            500: "#718096", // Medium gray for secondary text
            600: "#4a5568",
            700: "#2d3748",
            800: "#1a202c", // Dark gray for backgrounds
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
                bg: "gray.800", // Set the background to a dark gray
                color: "white", // White text color for better contrast
            },
            a: {
                color: "teal.200", // Teal color for links
                _hover: {
                    textDecoration: "underline",
                },
            },
            h1: {
                color: "white",
            },
        },
    },
});



// Create a react-query client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={darkTheme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </QueryClientProvider>
    );
}

export default MyApp;
