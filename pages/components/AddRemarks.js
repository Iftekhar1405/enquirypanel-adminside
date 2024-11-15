import { Box, Textarea, Button } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const addRemark = async (remarkData) => {
    const res = await axios.post('http://localhost:5000/remaks', remarkData); // Replace with actual endpoint
    return res.data;
};

export default function AddRemark({ enquiryId }) {
    const { mutate } = useMutation(addRemark);

    const handleRemarkSubmit = (e) => {
        e.preventDefault();
        const remarkData = {
            enquiryId,
            comment: e.target.comment.value,
            author: "Admin", // Dynamic author based on session
            timestamp: new Date().toISOString(),
        };
        mutate(remarkData);
    };

    return (
        <Box p={6}>
            <form onSubmit={handleRemarkSubmit}>
                <Textarea name="comment" placeholder="Add a remark..." isRequired />
                <Button type="submit" colorScheme="blue" mt={4}>
                    Add Remark
                </Button>
            </form>
        </Box>
    );
}
