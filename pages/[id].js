import { Box, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, Spinner, AccordionIcon, VStack, Button, Textarea, IconButton, Flex } from "@chakra-ui/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

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
const postRemark = async ({ enquiryId, remark }) => {
    const res = await axios.post(`http://localhost:5000/remarks`, { enquiryId, remark });
    return res.data;
};

// Mutation to update a remark
const updateRemark = async ({ remarkId, remark }) => {
    const res = await axios.put(`http://localhost:5000/remarks/${remarkId}`, { remark });
    return res.data;
};

// Mutation to delete a remark
const deleteRemark = async (remarkId) => {
    const res = await axios.delete(`http://localhost:5000/remarks/${remarkId}`);
    return res.data;
};

export default function EnquiryDetails() {
    const router = useRouter();
    const { id } = router.query;

    if (!id) return <Spinner />;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/login');
    }, [router]);

    const [newRemark, setNewRemark] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editRemarkId, setEditRemarkId] = useState(null);
    const queryClient = useQueryClient();

    // Fetch remarks data
    const { data: remarksData, isLoading: remarksLoading, isError: remarksError } = useQuery({
        queryKey: ["remarks", id],
        queryFn: () => fetchRemarksByEnquiryId(id), // Send enquiry ID to filter remarks
        enabled: !!id,
    });

    // Fetch enquiry details
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["enquiry", id],
        queryFn: () => fetchEnquiryById(id),
        enabled: !!id,
    });

    // Mutation for adding a new remark
    const addRemarkMutation = useMutation({
        mutationFn: postRemark,
        onSuccess: () => {
            queryClient.invalidateQueries(["remarks", id]);
            setNewRemark(""); // Clear the input after adding
        },
        onError: (error) => {
            // Handle error
            console.error("Error adding remark:", error);
        },
    });

    // Mutation for editing an existing remark
    const updateRemarkMutation = useMutation({
        mutationFn: updateRemark,
        onSuccess: () => {
            queryClient.invalidateQueries(["remarks", id]);
            setIsEditing(false);
            setEditRemarkId(null);
            setNewRemark(""); // Clear input after update
        },
        onError: (error) => {
            console.error("Error updating remark:", error);
        },
    });

    // Mutation for deleting a remark
    const deleteRemarkMutation = useMutation({
        mutationFn: deleteRemark,
        onSuccess: () => {
            queryClient.invalidateQueries(["remarks", id]);
        },
        onError: (error) => {
            console.error("Error deleting remark:", error);
        },
    });

    if (isLoading) return <Spinner />;
    if (isError) return <Box>Error: {error.message}</Box>;

    // Add or Edit a remark
    const handleRemarkSubmit = () => {
        if (newRemark.trim()) {
            if (isEditing) {
                updateRemarkMutation.mutate({
                    remarkId: editRemarkId,
                    remark: newRemark,
                });
            } else {
                addRemarkMutation.mutate({
                    enquiryId: id,
                    remark: newRemark,
                });
            }
        }
    };

    // Set remark for editing
    const handleEditRemark = (remark) => {
        setIsEditing(true);
        setEditRemarkId(remark._id);
        setNewRemark(remark.remark);
    };

    // Delete a remark
    const handleDeleteRemark = (remarkId) => {
        deleteRemarkMutation.mutate(remarkId);
    };

    return (
        <>
            <Navbar />
            <Box maxW="800px" mx="auto" p="4" mt='80px'>
                <Text fontSize="2xl" fontWeight="bold" mb="6">
                    Enquiry Details
                </Text>
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
                                <Flex key={index} justify='space-between' p="3" borderWidth="1px" borderRadius="md" mb="2" bg="gray.600">
                                   <Box>
                                   <Text fontSize="md" color="gray.100">{remark.remark}</Text>
                                    <Text fontSize="xs" color="gray.500" mt="2">
                                        Added on: {new Date(remark.createdAt).toLocaleDateString()},
                                        Edited on: {new Date(remark.updatedAt).toLocaleDateString()}
                                    </Text>
                                    </Box>
                                    <Box mt="2">
                                        <IconButton
                                            icon={<EditIcon />}
                                            colorScheme="yellow"
                                            size="sm"
                                            onClick={() => handleEditRemark(remark)}
                                            mr="2"
                                        />
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            colorScheme="red"
                                            size="sm"
                                            onClick={() => handleDeleteRemark(remark._id)}
                                        />
                                    </Box>
                                </Flex>
                            ))}
                        </Box>
                    ) : (
                        <Text>No remarks yet.</Text>
                    )}
                    <Textarea
                        mt="4"
                        placeholder={isEditing ? "Edit remark" : "Add a new remark"}
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                    />
                    <Button mt="2" colorScheme="blue" onClick={handleRemarkSubmit} isLoading={addRemarkMutation.isLoading || updateRemarkMutation.isLoading}>
                        {isEditing ? "Update Remark" : "Add Remark"}
                    </Button>
                    {remarksError && <Box mt="2" color="red.500">Error handling remarks</Box>}
                </Box>
            </Box>
        </>
    );
}
