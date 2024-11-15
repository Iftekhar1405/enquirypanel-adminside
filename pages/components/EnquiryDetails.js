import { Box, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Fetch enquiry details by ID
const fetchEnquiryDetails = async (id) => {
    const res = await axios.get(`http://localhost:5000/enquiry/${id}`); // Replace with actual API endpoint
    return res.data;
};

export default function EnquiryDetails() {
    const { id } = useParams();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["enquiryDetails", id],
        queryFn: () => fetchEnquiryDetails(id),
    });

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error fetching data.</Text>;

    return (
        <Box p={6}>
            <Text fontSize="2xl" fontWeight="bold">{data.studentFirstName} {data.studentLastName}</Text>
            <Accordion allowToggle>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                Profile Overview
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <VStack align="start" spacing="2">
                            <Text>Email: {data.email}</Text>
                            <Text>Guardian: {data.guardianName}</Text>
                            <Text>Phone: {data.phone}</Text>
                            <Text>Address: {data.street}, {data.city}, {data.state}, {data.zip}, {data.country}</Text>
                            <Text>Description: {data.description}</Text>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    );
}
