import { Box, Text, Button, SimpleGrid } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "./components/navbar";

// Fetch total enquiries count
const fetchTotalEnquiries = async () => {
    const res = await axios.get("http://localhost:5000/enquiry"); // Replace with actual API endpoint
    return res.data.length; // Assuming the API returns a list of enquiries
};

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const tokendata = localStorage.getItem("token");
        console.log("token", tokendata);
        if (!tokendata) {
            router.push("/login"); // Redirect to login page if token is missing
        }
    }, [router]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["totalEnquiries"],
        queryFn: fetchTotalEnquiries,
    });

    console.log("dashboard");

    return (
        <>
        <Navbar back='/'/>
            <Box p={6} mt='80px'>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <Box p={5} shadow="md" borderWidth="1px" bg="gray.800" color="white">
                        <Text fontSize="lg">Total Enquiries</Text>
                        <Text fontSize="3xl">{isLoading ? "Loading..." : data}</Text>
                    </Box>
                    <Box p={5} shadow="md" borderWidth="1px" bg="gray.800" color="white">
                        <Button colorScheme="blue">Create Enquiry</Button>
                    </Box>
                </SimpleGrid>
            </Box>
        </>
    );
}
