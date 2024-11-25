import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useErrorAlert, useSuccessAlert } from "../common/Alertfn";

export default function EditEnquiry({ isOpen, onClose, data }) {
  // console.log("dataen",data)
  const SuccessAlert = useSuccessAlert();
  const ErrorAlert = useErrorAlert();
  const [formState, setFormState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const { _id, __v, ...newData } = data;
    setFormState(newData);
    // console.log("newdata", newData, "data", data, "formstate", formState);
  }, [data]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/enquiry/${data._id}`, // Update endpoint
        formState
      );
      SuccessAlert("Enquiry updated successfully!");
      onClose(); // Close the modal after success
    } catch (error) {
      console.error("Error updating enquiry:", error);
      ErrorAlert("Failed to update enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"5xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Enquiry</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {Object.entries(formState || {}).map(([key, value]) => {
              // console.log("keys and value",key , value)
              return (
                <FormControl key={key}>
                  <HStack>
                    <FormLabel flex={1}>{key}</FormLabel>
                    <Input
                      name={key}
                      value={formState[key] || ""}
                      onChange={handleInputChange}
                      flex={1}
                    />
                  </HStack>
                </FormControl>
              );
            })}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Update
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
