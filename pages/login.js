import React, { useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios from "axios";

export default function LoginSignup() {
    const toast = useToast();
    const router = useRouter();

    async function login(form) {
        const res = await axios.post("http://localhost:5000/auth", form);
        return res.data; // Return the actual data from the response
    }
    useEffect(()=>{
        const token = localStorage.getItem('token')
        if(token) router.push('/')
    },[router])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
        };
        console.log("Login data:", data);

        try {
            const res = await login(data);
            console.log(res);

            // Assuming the token is in `res.token`
            const token = res.token;
            if (token) {
                localStorage.setItem("token", token); // Store the token
                toast({
                    title: "Login successful.",
                    description: "You have logged in successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                router.push("/"); // Redirect to home
            } else {
                throw new Error("Token not found in response");
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Login failed.",
                description: error.message || "An error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box
            maxW="md"
            mx="auto"
            mt={10}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="lg"
        >
            <Text textAlign="center" fontSize="2xl" mb={5}>
                Login to Your Account
            </Text>
            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>Email Address</FormLabel>
                        <Input name="email" type="email" placeholder="Email" />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            name="password"
                            type="password"
                            placeholder="Password"
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        colorScheme="teal"
                        width="full"
                        mt={4}
                        isLoading={false}
                    >
                        Login
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
