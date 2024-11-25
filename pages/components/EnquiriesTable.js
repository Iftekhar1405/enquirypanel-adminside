import { DeleteIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiSelector } from "react-icons/hi";
import { LuFilter, LuPrinter } from "react-icons/lu";
import Select from "react-select";
import { useTable } from "react-table";
import { useReactToPrint } from "react-to-print";
import { useErrorAlert, useSuccessAlert } from "../common/Alertfn";
import EditEnquiry from "../edit/id";
import { filterKeys, filterKeysValues } from "./filter";

export default function EnquiriesTable() {
  const router = useRouter();
  const { fields } = router.query;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSelectFieldModalOpen, setIsSelectFieldModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filters, setFilters] = useState({});
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // For debounced filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [input, setInput] = useState("1");
  const [printing, setPrinting] = useState(false);
  const [fetch, setFetch] = useState(true);
  const [enquiryData, setEnquiryData] = useState({});
  const SuccessAlert = useSuccessAlert();
  const ErrorAlert = useErrorAlert();
  const printRef = useRef(null);

  // console.log(fields);
  const [selectedFields, setSelectedField] = useState(
    fields
      ? JSON.parse(fields)
      : [
          { Header: "Description", accessor: "description", show: true },
          { Header: "Student Name", accessor: "studentFirstName", show: true },
          { Header: "Grade", accessor: "grade", show: true },
          { Header: "Gender", accessor: "gender", show: false },
          { Header: "Hostel", accessor: "hostel", show: false },
          { Header: "Guardian", accessor: "guardianName", show: true },
          { Header: "Enquiry Source", accessor: "enquirySource", show: false },
          { Header: "Email", accessor: "email", show: false },
          { Header: "Phone", accessor: "phone", show: false },
          { Header: "Mobile", accessor: "mobile", show: true },
          { Header: "City", accessor: "city", show: false },
          { Header: "State", accessor: "state", show: true },
          { Header: "Country", accessor: "country", show: true },
          {
            Header: "Actions",
            show: true,
          },
        ]
  );

  // const [finalFilter,setFinalFilter] = useState([])
  // console.log("selected", selectedFields, typeof true);

  const fetchEnquiries = async (searchTerm, filters, page, limit) => {
    const params = {
      searchTerm: searchTerm || "", // Pass the search term directly
      value: searchTerm,
      filters: filters ? JSON.stringify(filters) : "{}", // Ensure filters are a valid JSON string
      page,
      limit,
    };
    // console.log("fetchEnquiries");
    const res = await axios.get("http://localhost:5000/enquiry/search", {
      params,
    });
    setFetch(false);
    // console.log("res",res)
    return res.data;
  };
  const { isOpen, onOpen, onClose } = useDisclosure();

  const debouncedSearch = useMemo(
    () => debounce((term) => setDebouncedSearchTerm(term), 800),
    []
  );
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const {
    data: enquiries,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["enquiries", debouncedSearchTerm, debouncedFilters, page, limit],
    queryFn: () =>
      fetchEnquiries(debouncedSearchTerm, debouncedFilters, page, limit),
  });
  const { data, count, pageCount } = enquiries || {};
  // console.log("console",data,count,pageCount)
  const editFunc = (e, row) => {
    e.stopPropagation();
    // console.log(row)
    setEnquiryData(row.original);
    // console.log(enquiryData)
    onOpen();
  };

  const columns = useMemo(() => selectedFields, [router, selectedFields]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const queryClient = useQueryClient();
  const handleDelete = async (e, id) => {
    try {
      e.stopPropagation();
      await axios.delete(`http://localhost:5000/enquiry/${id}`);
      SuccessAlert("Enquiry deleted successfully!");
      queryClient.invalidateQueries(["enquiries"]);
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
      ErrorAlert("Enquiry deletetion failed!");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleApplyFilters = () => {
    const nonEmptyFilters = Object.keys(filters).reduce((acc, key) => {
      if (filters[key]) acc[key] = filters[key];
      if (key === "hostel") {
        if (acc[key] === "true") {
          acc[key] = true;
        } else {
          acc[key] = false;
        }
      }
      // console.log(filters);
      return acc;
    }, {});

    setDebouncedFilters(nonEmptyFilters);
    // console.log(debouncedFilters);
    setIsFilterModalOpen(false);
  };

  const clearFilter = () => {
    setDebouncedFilters({});
    setFilters({});
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: data || [],
    });

  const handlePageChange = (num) => {
    const newPage = parseInt(num);
    if (newPage <= pageCount && newPage > 0) {
      setPage(newPage);
      setInput(newPage);
    } else {
      setPage(1);
      setInput("");
    }
    console.log(pageCount, newPage);
  };

  const handleLimitChange = (valueString) => {
    const newLimit = parseInt(valueString, 10);
    setLimit(newLimit);
  };

  useEffect(() => {
    if (!isOpen) refetch();
  }, [isOpen, refetch]);
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const headBg = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const headTextColor = useColorModeValue("white", "black");
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHoverBg = useColorModeValue("gray.200", "gray.600");

  const handleFieldsChange = () => {
    router.push({
      pathname: "/",
      query: { fields: JSON.stringify(selectedFields) },
    });
    setIsSelectFieldModalOpen(false);
  };
  useEffect(() => {
    if (fields) {
      setSelectedField(JSON.parse(fields));
    }
  }, [fields]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,

    onBeforeGetContent: () => {
      return new Promise((res) => {
        setPrinting(true);
        console.log("hello");
        const element = printRef.current;
        const originalOverflow = element.style.overflow;

        element.style.overflow = "visible";

        res();

        return () => {
          element.style.overflow = originalOverflow;
        };
      });
    },
  });

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Box
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg={tableBg}
      >
        {/* Left Section */}
        <VStack align="start" spacing={2}>
          <Tag fontSize="sm" colorScheme="green">
            Total enquiries: {count}
          </Tag>
          <HStack p={4} align="center" spacing={4}>
            <InputGroup>
              <Input
                placeholder="Search by any field"
                value={searchTerm}
                onChange={handleSearchChange}
                width="100%"
                maxWidth="400px"
                bg={inputBg}
                borderColor={inputBorder}
                color={textColor}
              />
              <InputRightElement>
                <SearchIcon />
              </InputRightElement>
            </InputGroup>
            <Button
              leftIcon={<LuFilter />}
              onClick={() => setIsFilterModalOpen(true)}
              colorScheme="blue"
              p={5}
              px={8}
            >
              {Object.keys(debouncedFilters).length !== 0
                ? "Edit Filters"
                : "Add Filters"}
            </Button>
            {Object.keys(debouncedFilters).length !== 0 && (
              <Button
                onClick={clearFilter}
                colorScheme="red"
                variant="outline"
                p={5}
                px={8}
              >
                Clear Filter
              </Button>
            )}
            <Button
              leftIcon={<HiSelector />}
              onClick={() => setIsSelectFieldModalOpen(true)}
              colorScheme="blue"
              p={5}
              px={8}
            >
              Select Fields
            </Button>
            <IconButton icon={<LuPrinter />} onClick={handlePrint} />
          </HStack>
        </VStack>

        <VStack align="end" spacing={2}>
          <Tag fontSize="sm" colorScheme="green">
            Total pages: {pageCount}
          </Tag>
          <HStack p="4">
            <Text>Page:</Text>
            {/* <Button
              leftIcon={<ChevronLeftIcon />}
              colorScheme="teal"
              onClick={() => handlePageChange(Number(page) - 1)}
              isDisabled={page <= 1}
            /> */}
            <NumberInput
              // defaultValue={page.toString}
              minW="65px"
              maxW="100px"
              value={input}
              onChange={(valueString) => handlePageChange(valueString)}
              max={pageCount}
              min={1}
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {/* <Button
              rightIcon={<ChevronRightIcon />}
              colorScheme="teal"
              onClick={() => handlePageChange(Number(page) + 1)}
              isDisabled={page >= pageCount}
            /> */}
            <Text>Limit:</Text>
            <NumberInput
              // defaultValue={page.toString}
              minW="70px"
              maxW="100px"
              value={limit}
              onChange={(valueString) => handleLimitChange(valueString)}
              max={count}
              min={1}
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        </VStack>
      </Box>
      <Modal
        isOpen={isSelectFieldModalOpen}
        onClose={() => setIsSelectFieldModalOpen(false)}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Fields</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid gridTemplateColumns={"repeat(2,1fr)"} gap={5} p={5}>
              {selectedFields.map((field) => (
                <Checkbox
                  isChecked={field.show}
                  key={field.Header}
                  onChange={() => {
                    setSelectedField((cols) =>
                      cols.map((col) =>
                        col.Header === field.Header
                          ? { ...col, show: !col.show }
                          : col
                      )
                    );
                    // console.log(selectedFields);
                  }}
                >
                  {field.Header}
                </Checkbox>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleFieldsChange}>Apply</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        size={"2xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {filterKeys.map((key) => (
                <HStack key={key} width="100%">
                  <Text flex={1}>{key}:</Text>
                  <Input
                    placeholder={`Enter ${key} value`}
                    value={filters[key] || ""}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    flex={1}
                  />
                </HStack>
              ))}
            </VStack>
            <VStack spacing={4} mt={5}>
              {Object.entries(filterKeysValues).map(([key, value]) => (
                <HStack key={key} width="100%">
                  <Text flex={1}>{key}:</Text>
                  <Select
                    options={value.map((item) => {
                      // console.log(item);
                      return { label: item, value: item };
                    })}
                    placeholder="choose an option"
                    value={
                      filters[key]
                        ? { label: filters[key], value: filters[key] }
                        : null
                    }
                    onChange={(option) => handleFilterChange(key, option.value)}
                    styles={{
                      control: (styles) => ({
                        ...styles,
                        backgroundColor: "#2d3748",
                        width: "350px",
                      }),
                      option: (styles, { isSelected, isFocused }) => ({
                        ...styles,
                        backgroundColor: isSelected
                          ? "#4a5568"
                          : isFocused
                          ? "#4a5568"
                          : "#2d3748",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#4a5568",
                        },
                      }),
                      singleValue: (styles) => ({ ...styles, color: "white" }),
                    }}
                  />
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isLoading ? (
        <Spinner size="lg" />
      ) : isError ? (
        <Text color="red.500">
          Error fetching data. Please try again later.
        </Text>
      ) : data && data.length === 0 ? (
        <Text>No data found</Text>
      ) : (
        <div className="print">
          <TableContainer>
            <Table {...getTableProps()} bg={tableBg} ref={printRef}>
              <Thead>
                {headerGroups.map((headerGroup) => (
                  <Tr {...headerGroup.getHeaderGroupProps()} bg={headBg}>
                    {headerGroup.headers.map((column) => {
                      const toShow = column.show;
                      return (
                        toShow && (
                          <Th
                            {...column.getHeaderProps()}
                            color={headTextColor}
                          >
                            {column.render("Header")}
                          </Th>
                        )
                      );
                    })}
                    <Th
                      sx={{
                        "@media print": {
                          display: "none",
                        },
                      }}
                    >
                      Action
                    </Th>
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <Tr
                      {...row.getRowProps()}
                      _hover={{ bg: tableHoverBg }}
                      cursor="pointer"
                      onClick={() => router.push(`/${row.original._id}`)}
                    >
                      {row.cells.map((cell) => {
                        // console.log("cell", cell);
                        const toShow = cell.column.show;
                        return (
                          toShow && (
                            <Td
                              {...cell.getCellProps()}
                              maxW="300px"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {typeof cell.value == "boolean" ? (
                                cell.value.toString()
                              ) : cell.column.Header === "Actions" &&
                                !printing ? (
                                <ActionButton
                                  row={row}
                                  editFunc={editFunc}
                                  handleDelete={handleDelete}
                                />
                              ) : cell.value !== undefined &&
                                cell.value !== null ? (
                                cell.render("Cell")
                              ) : (
                                "N/A"
                              )}
                            </Td>
                          )
                        );
                      })}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      )}
      <EditEnquiry isOpen={isOpen} onClose={onClose} data={enquiryData} />
    </Box>
  );
}

function ActionButton({ row, editFunc, handleDelete }) {
  return (
    <HStack
      spacing={2}
      sx={{
        "@media print": {
          display: "none",
        },
      }}
    >
      <IconButton
        icon={<EditIcon />}
        onClick={(e) => editFunc(e, row)}
        aria-label="Edit"
        size="sm"
        colorScheme="cyan"
      />
      <IconButton
        icon={<DeleteIcon />}
        onClick={(e) => handleDelete(e, row.original._id)}
        aria-label="Delete"
        size="sm"
        colorScheme="red"
      />
    </HStack>
  );
}
