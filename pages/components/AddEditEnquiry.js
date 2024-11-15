import { Box, FormControl, FormLabel, Input, Button, Textarea } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Mutation to add/edit enquiry
const addEditEnquiry = async (data) => {
    const res = await axios.post('http://localhost:5000/enquiry', data); // Replace with correct endpoint
    return res.data;
};

export default function AddEditEnquiry() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const mutation = useMutation(addEditEnquiry);

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <Box p={6}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl isRequired>
                    <FormLabel>Student First Name</FormLabel>
                    <Input {...register("studentFirstName", { required: true })} />
                    {errors.studentFirstName && <Text color="red.500">This field is required</Text>}
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Guardian Name</FormLabel>
                    <Input {...register("guardianName", { required: true })} />
                </FormControl>

                <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea {...register("description")} />
                </FormControl>

                <Button type="submit" colorScheme="blue" mt={4}>
                    {mutation.isLoading ? "Saving..." : "Save Enquiry"}
                </Button>
            </form>
        </Box>
    );
}
