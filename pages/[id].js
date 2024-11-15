import { Box, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel,Spinner, AccordionIcon, VStack, Button, Input, Textarea } from "@chakra-ui/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";

// Fetch a single enquiry by ID
const fetchEnquiryById = async (id) => {
    const res = await axios.get(`http://localhost:5000/enquiry/${id}`);
    return res.data;
};
// Fetch remarks by enquiry ID
const fetchRemarksByEnquiryId = async (enquiryId) => {
    const res = await axios.get(`http://localhost:5000/remarks?enquiryId=${enquiryId}`);
    return res.data;
};





// Mutation to post a new remark


export default function EnquiryDetails() {
    const router = useRouter();
    const { id } = router.query;

    if(!id) return <Spinner/>
    //
    const [newRemark, setNewRemark] = useState("");
    const queryClient = useQueryClient();

    // Use this in the query to fetch remarks
    const { data: remarksData, isLoading: remarksLoading } = useQuery({
        queryKey: ["remarks", id],
        queryFn: () => fetchRemarksByEnquiryId(id),
        enabled: !!id,
    });

    // Post a new remark
    const postRemark = async ({ enquiryId, remark }) => {
        const res = await axios.post(`http://localhost:5000/remarks`, { enquiryId, remark });
        return res.data;
    };

// Mutation to add a remark
    const addRemarkMutation = useMutation({
        mutationFn: postRemark,
        onSuccess: () => {
            queryClient.invalidateQueries(["remarks", id]);
            setNewRemark(""); // Clear the input after adding
        },
    });

// Updated addRemark function


    // Fetch enquiry details
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["enquiry", id],
        queryFn: () => fetchEnquiryById(id),
        enabled: !!id,
    });


    // Mutation for adding a new remark
    const remarkMutation = useMutation({
        mutationFn: postRemark,
        onSuccess: () => {
            queryClient.invalidateQueries(["enquiry", id]); // Refresh enquiry data to show the new remark
            setNewRemark("");
        },
    });

    if (isLoading) return <Spinner/>;
    if (isError) return <Box>Error: {error.message}</Box>;




    // Add a new remark to the enquiry
    const addRemark = () => {
        remarkMutation.mutate({
            enquiryId: id,
            remark:  newRemark
        });
    };

    return (
        <Box maxW="800px" mx="auto" p="4">
            <Text fontSize="2xl" fontWeight="bold" mb="6">
                Enquiry Details
            </Text>
            {/*{isLoading &&  <Spinner/> }*/}
            <Accordion allowToggle defaultIndex={[0]}>
                <AccordionItem borderWidth="1px" borderRadius="md" mb="2">
                    <h2>
                        <AccordionButton _expanded={{ bg: "red.100" }}>
                            <Box as="span" flex="1" textAlign="left" fontWeight="medium" fontSize="lg">
                                {data?.studentFirstName} {data.studentLastName} (Grade {data.grade})
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb="4">
                        <VStack align="start" spacing="2">


                                <>
                                    <Text fontSize="sm" color="gray.600">Guardian: {data.guardianName}</Text>
                                    <Text fontSize="sm" color="gray.600">Email: {data.email}</Text>
                                    <Text fontSize="sm" color="gray.600">Mobile: {data.mobile}</Text>
                                    <Text fontSize="sm" color="gray.600">Phone: {data.phone}</Text>
                                    <Text fontSize="sm" color="gray.600">DOB: {new Date(data.dob).toLocaleDateString()}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Address: {data.street}, {data.city}, {data.state}, {data.zip}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">Country: {data.country}</Text>
                                    <Text fontSize="sm" color="gray.600">Enquiry Source: {data.enquirySource}</Text>
                                    <Text fontSize="md" mt="2">Description: {data.description}</Text>
                                </>

                        </VStack>

                            <Button mt="4" colorScheme="teal" onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/edit/${id}`);
                            }}>
                                Edit
                            </Button>

                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            <Box mt="6">
                <Text fontSize="lg" fontWeight="bold" mb="2">Remarks</Text>
                {remarksData && remarksData.length > 0 ? (
                    <Box>
                        {remarksData.map((remark, index) => (
                            <Box key={index} p="3" borderWidth="1px" borderRadius="md" mb="2" bg="gray.600">
                                <Text fontSize="md" color="gray.100">{remark.remark}</Text>
                                <Text fontSize="xs" color="gray.500" mt="2">
                                    Added on: {new Date(remark.createdAt).toLocaleDateString()}
                                    ,
                                     Edited on: {new Date(remark.updatedAt).toLocaleDateString()}

                                </Text>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Text>No remarks yet.</Text>
                )}
                <Textarea
                    mt="4"
                    placeholder="Add a new remark"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                />
                <Button mt="2" colorScheme="blue" onClick={addRemark} isLoading={addRemarkMutation.isLoading}>
                    Add Remark
                </Button>
            </Box>



        </Box>
    );
}
