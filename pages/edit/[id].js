// pages/enquiries/edit/[id].js

import { Box, Input, Button, FormControl, FormLabel, Text, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";

// Fetch single enquiry data
const fetchEnquiry = async (id) => {
    const res = await axios.get(`http://localhost:5000/enquiry/${id}`);
    return res.data;
};

// Update enquiry data
const updateEnquiry = async (enquiry) => {
    const { id, ...data } = enquiry;
    await axios.put(`http://localhost:5000/enquiry/${id}`, data);
};

export default function EditEnquiry() {
    const router = useRouter();
    const { id } = router.query;
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["enquiry", id],
        queryFn: () => fetchEnquiry(id),
        enabled: !!id, // Ensures query only runs if `id` is defined
    });

    const mutation = useMutation({
        mutationFn: updateEnquiry,
        onSuccess: () => {
            queryClient.invalidateQueries(["enquiries"]);
            router.push("/");
        },
    });

    const [formData, setFormData] = useState({
        studentFirstName: "",
        grade: "",
        guardianName: "",
        enquirySource: "",
        email: "",
        phone: "",
        mobile: "",
        city: "",
        state: "",
        country: "",
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ id, ...formData });
    };

    if (isLoading) return <Spinner />;
    if (isError) return <Text>Error loading enquiry data.</Text>;

    return (
        <Box p={6}>
            <Text fontSize="2xl" mb={4}>Edit Enquiry</Text>
            <form onSubmit={handleSubmit}>
                <FormControl mb={3}>
                    <FormLabel>Student First Name</FormLabel>
                    <Input
                        name="studentFirstName"
                        value={formData.studentFirstName}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>Grade</FormLabel>
                    <Input
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>Guardian Name</FormLabel>
                    <Input
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>Phone</FormLabel>
                    <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>Mobile</FormLabel>
                    <Input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>City</FormLabel>
                    <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>State</FormLabel>
                    <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl mb={3}>
                    <FormLabel>Country</FormLabel>
                    <Input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                </FormControl>
                <Button type="submit" colorScheme="teal" mt={4} isLoading={mutation.isLoading}>
                    Save Changes
                </Button>
            </form>
        </Box>
    );
}
