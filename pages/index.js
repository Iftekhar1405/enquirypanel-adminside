"use client";

// import EnquiriesTable from "@/pages/components/EnquiriesTable";
import { Box, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/navbar";

const fetchData = async (URL) => {
  const res = await axios.get(URL);
  return res.data;
};
const EnquiriesTable = lazy(() => import("@/pages/components/EnquiriesTable"));
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["enquiries"],
    queryFn: () => fetchData("http://localhost:5000/enquiry"), // Replace with your actual API endpoint
  });

  if (isLoading) {
    return (
      <Box>
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return <Box>Error: {error.message}</Box>;
  }

  const logoutpage = () => {
    const token = localStorage.removeItem("token");
    if (!token) {
      router.push("/login");
    }
  };

  return (
    <>
      <Navbar back="" />
      <Box px={5} py={5} mt="80px">
        <Suspense fallback={<Spinner />}>
          <EnquiriesTable />
        </Suspense>
        <Box maxW="800px" mx="auto" p="4">
          {/* <Text fontSize="2xl" fontWeight="bold" mb="6">
                Enquiries
            </Text> */}
          {/* <Accordion allowToggle>
                {data && data.length > 0 ? (
                    data.map((enquiry) => (
                        <AccordionItem key={enquiry._id} borderWidth="1px" borderRadius="md" mb="2">
                            <h2>
                                <AccordionButton _expanded={{ bg: "red.100" }}>
                                    <Box as="span" flex="1" textAlign="left" fontWeight="medium" fontSize="lg">
                                        {enquiry.studentFirstName} {enquiry.studentLastName} (Grade {enquiry.grade})
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb="4">
                                <VStack align="start" spacing="2">
                                    <Text fontSize="sm" color="gray.600">Guardian: {enquiry.guardianName}</Text>
                                    <Text fontSize="sm" color="gray.600">Email: {enquiry.email}</Text>
                                    <Text fontSize="sm" color="gray.600">Mobile: {enquiry.mobile}</Text>
                                    <Text fontSize="sm" color="gray.600">Phone: {enquiry.phone}</Text>
                                    <Text fontSize="sm" color="gray.600">DOB: {new Date(enquiry.dob).toLocaleDateString()}</Text>
                                    <Text fontSize="sm" color="gray.600">Address: {enquiry.street}, {enquiry.city}, {enquiry.state}, {enquiry.zip}</Text>
                                    <Text fontSize="sm" color="gray.600">Country: {enquiry.country}</Text>
                                    <Text fontSize="sm" color="gray.600">Enquiry Source: {enquiry.enquirySource}</Text>
                                    <Text fontSize="md" mt="2">Description: {enquiry.description}</Text>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                    ))
                ) : (
                    <Text>No enquiries found.</Text>
                )}
            </Accordion> */}
        </Box>
      </Box>
    </>
  );
}
