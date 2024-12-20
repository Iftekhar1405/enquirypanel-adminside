import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { HiPrinter } from "react-icons/hi2";
import { useReactToPrint } from "react-to-print";
import { useErrorAlert, useSuccessAlert } from "./common/Alertfn";
import { Loader } from "./components/Loader";
import Navbar from "./components/navbar";
import EditEnquiry from "./edit/id";

const fetchEnquiryById = async (id) =>
  (await axios.get(`http://localhost:5000/enquiry/${id}`)).data;

const fetchRemarksByEnquiryId = async (enquiryId) =>
  (await axios.get(`http://localhost:5000/remarks?enquiryId=${enquiryId}`))
    .data;

const postRemark = async ({ enquiryId, remark }) =>
  (await axios.post(`http://localhost:5000/remarks`, { enquiryId, remark }))
    .data;

const updateRemark = async ({ remarkId, remark }) =>
  (await axios.put(`http://localhost:5000/remarks/${remarkId}`, { remark }))
    .data;

const deleteRemark = async (remarkId) =>
  (await axios.delete(`http://localhost:5000/remarks/${remarkId}`)).data;

export default function EnquiryDetails() {
  const SuccessAlert = useSuccessAlert();
  const ErrorAlert = useErrorAlert();
  const router = useRouter();
  const { id } = router.query;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newRemark, setNewRemark] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editRemarkId, setEditRemarkId] = useState(null);
  const queryClient = useQueryClient();
  const printRef = useRef(null);
  const [aiInsight, setAIInsight] = useState("");
  const [expectedReply, setExpectedReply] = useState("");

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // Fetch enquiry data
  const {
    data: enquiryData,
    isLoading: isEnquiryLoading,
    isError: isEnquiryError,
    error: enquiryError,
    refetch,
  } = useQuery({
    queryKey: ["enquiry", id],
    queryFn: () => fetchEnquiryById(id),
    enabled: !!id,
  });

  // Fetch remarks data
  const {
    data: remarksData,
    isLoading: areRemarksLoading,
    isError: areRemarksError,
  } = useQuery({
    queryKey: ["remarks", id],
    queryFn: () => fetchRemarksByEnquiryId(id),
    // enabled: !!id,
  });

  // Mutations
  const addRemarkMutation = useMutation({
    mutationFn: postRemark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remarks", id] });
      setNewRemark("");
      SuccessAlert("Remark added successfully");
    },
    onError: () => {
      ErrorAlert("Failed to add remark");
    },
  });
  useEffect(() => {
    if (!isOpen) refetch();
  }, [isOpen, refetch]);

  const updateRemarkMutation = useMutation({
    mutationFn: updateRemark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remarks", id] });
      setIsEditing(false);
      setEditRemarkId(null);
      setNewRemark("");
      SuccessAlert("Remark updated successfully!");
    },
    onError: () => {
      ErrorAlert("Failed to update remark.");
    },
  });

  const deleteRemarkMutation = useMutation({
    mutationFn: deleteRemark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remarks", id] });
      SuccessAlert("Remark deleted successfully!");
    },
    onError: () => {
      ErrorAlert("Failed to delete remark.");
    },
  });

  if (!id || isEnquiryLoading) return <Spinner />;
  if (isEnquiryError) return <Box>Error: {enquiryError.message}</Box>;
  const genAI = new GoogleGenerativeAI(
    "AIzaSyCV5D1rcZ3EN9sa0l7elScHMnawyAmEiUM"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  async function genRes() {
    const res =
      await model.generateContent(`hey we are the school administrate, one of the parents have a query
      that is ${enquiryData.description}.\n the child is in ${enquiryData.grade}\n what insights can you give about this enquiry`);
    const expRes =
      await model.generateContent(`hey we are the school administrate, one of the parents have a query
    that is ${enquiryData.description}.\n the child is in ${enquiryData.grade}\n what could be the reply of this enquiry`);

    console.log(res.response.text());
    setAIInsight(res.response.text());
    setExpectedReply(expRes.response.text());
  }
  useEffect(() => {
    genRes();
  }, []);

  const handleRemarkSubmit = () => {
    if (newRemark.trim()) {
      if (isEditing) {
        updateRemarkMutation.mutate({
          remarkId: editRemarkId,
          remark: newRemark,
        });
      } else {
        addRemarkMutation.mutate({ enquiryId: id, remark: newRemark });
      }
    }
  };

  const handleEditRemark = (remark) => {
    setIsEditing(true);
    setEditRemarkId(remark._id);
    setNewRemark(remark.remark);
  };

  const handleDeleteRemark = (remarkId) => {
    deleteRemarkMutation.mutate(remarkId);
  };

  const { _id, __v, ...enquiryDetails } = enquiryData;
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <>
      <Navbar back="/" />
      <Loader isLoading={isEnquiryLoading}>
        <Box
          maxW="1200px"
          mx="auto"
          p="4"
          mt="80px"
          bg={bgColor}
          color={textColor}
        >
          <Tabs size="md" variant="enclosed" colorScheme="red">
            <TabList>
              <Tab>Details</Tab>
              <Tab>Remarks</Tab>
            </TabList>
            <TabPanels>
              <TabPanel ref={printRef} bg={bgColor} color={textColor}>
                <HStack justify="space-between" mb={4}>
                  <HStack>
                    <Avatar name={enquiryData.studentFirstName} />
                    <Text fontSize="xl" fontWeight="semibold">
                      {enquiryData.studentFirstName}{" "}
                      {enquiryData.studentLastName}
                    </Text>
                  </HStack>
                  <HStack>
                    <Button
                      leftIcon={<EditIcon />}
                      onClick={onOpen}
                      colorScheme="teal"
                      sx={{
                        "@media print": {
                          display: "none",
                        },
                      }}
                    >
                      Edit Enquiry
                    </Button>
                    <IconButton
                      icon={<HiPrinter />}
                      onClick={handlePrint}
                      sx={{
                        "@media print": {
                          display: "none",
                        },
                      }}
                    />
                  </HStack>
                </HStack>
                <Box p="4" borderWidth="1px" borderRadius="md">
                  <VStack spacing={4} align="start">
                    {Object.keys(enquiryDetails).map((key) => (
                      <HStack key={key} w="100%">
                        <Text w="30%" fontWeight="bold">
                          {key}
                        </Text>
                        <Text flex={1}>: {enquiryDetails[key] ?? "-"}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <Text size={"2xl"} p={5}>
                  Insights
                </Text>
                <Box p={5}>{aiInsight ? aiInsight : ""}</Box>
                <Text size={"2xl"} p={5}>
                  Expected Reply
                </Text>
                <Box p={5}>{expectedReply ? expectedReply : ""}</Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    Add New Remark
                  </Text>
                  <Textarea
                    mt="4"
                    placeholder={isEditing ? "Edit remark" : "Add a new remark"}
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                  />
                  <Button
                    mt="2"
                    size="sm"
                    colorScheme="blue"
                    onClick={handleRemarkSubmit}
                    isLoading={
                      addRemarkMutation.isLoading ||
                      updateRemarkMutation.isLoading
                    }
                  >
                    {isEditing ? "Update Remark" : "Add Remark"}
                  </Button>
                  {areRemarksError && (
                    <Box mt="2" color="red.500">
                      Error handling remarks
                    </Box>
                  )}
                  <Text fontSize="lg" fontWeight="bold" mb="2" mt={4}>
                    Remarks
                  </Text>

                  {remarksData && remarksData.length > 0 ? (
                    <Box
                      display={"grid"}
                      gridTemplateColumns={"repeat(2,1fr)"}
                      gap={5}
                    >
                      {remarksData.map((remark, index) => (
                        <Flex
                          key={index}
                          justify="space-between"
                          p="3"
                          borderWidth="1px"
                          borderRadius="md"
                          mb="2"
                          bg="gray.600"
                        >
                          <Box>
                            <Text fontSize="md" color="gray.100">
                              {remark.remark}
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt="2">
                              Added on:{" "}
                              {new Date(remark.createdAt).toLocaleDateString()},
                              Edited on:{" "}
                              {new Date(remark.updatedAt).toLocaleDateString()}
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
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Loader>
      {/* {console.log("endata", enquiryData)} */}
      <EditEnquiry isOpen={isOpen} onClose={onClose} data={enquiryData} />
    </>
    // <Box>helo</Box>
  );
}
