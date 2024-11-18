import {
    Box,
    Input,
    Button,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Select,
    HStack,
    IconButton,
    TableContainer,
    useColorModeValue,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useTable } from "react-table";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import {
    AddIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon,
    DeleteIcon,
    EditIcon,
} from "@chakra-ui/icons";

// Fetch enquiries data with filters
export default function EnquiriesTable() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [filters, setFilters] = useState([]); // To store multiple filters
    const [debouncedFilters, setDebouncedFilters] = useState(filters); // For debounced filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [fetch, setFetch] = useState(true);

    const fetchEnquiries = async (searchTerm, filters, page, limit) => {
        const params = {
            searchTerm: searchTerm || "", // Pass the search term directly
            value: searchTerm,
            filters: filters ? JSON.stringify(filters) : "[]", // Ensure filters are a valid JSON string
            page,
            limit,
        };
        console.log("fetchEnquiries");
        const res = await axios.get("http://localhost:5000/enquiry/search", { params });
        setFetch(false);
        return res.data;
    };

    // Debounce the search input to avoid refetching on every keystroke
    useEffect(() => {
        const handler = debounce(() => setDebouncedSearchTerm(searchTerm), 800); // 1 second debounce for search term
        handler();
        // return () => handler.cancel();
    }, [searchTerm]);

    // Debounce filters
    useEffect(() => {
        const handler = debounce(() => setDebouncedFilters(filters), 800); // 1 second debounce for filters
        handler();
        // return () => handler.cancel();
    }, [filters]);

    // Pass debouncedSearchTerm and debouncedFilters to fetchEnquiries
    const validFilters = debouncedFilters.filter((f) => f.key && f.value); // Only keep filters with both key and value

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["enquiries", debouncedSearchTerm, debouncedFilters, page, limit],
        queryFn: () => fetchEnquiries(debouncedSearchTerm, debouncedFilters, page, limit),
    });

    const columns = React.useMemo(
        () => [
            { Header: "Description", accessor: "description",id: "description"  },
            { Header: "Student Name", accessor: "studentFirstName" },
            { Header: "Grade", accessor: "grade" },
            { Header: "Guardian", accessor: "guardianName" },
            { Header: "Enquiry Source", accessor: "enquirySource" },
            { Header: "Email", accessor: "email" },
            { Header: "Phone", accessor: "phone" },
            { Header: "Mobile", accessor: "mobile" },
            { Header: "City", accessor: "city" },
            { Header: "State", accessor: "state" },
            { Header: "Country", accessor: "country" },
            {
                Header: "Actions",
                Cell: ({ row }) => (
                    <HStack spacing={2}>
                        <IconButton
                            icon={<EditIcon/>}
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/edit/${row.original._id}`);
                            }   }
                            aria-label="Edit"
                            size="sm"
                            colorScheme="cyan"/>
                        <IconButton
                            icon={<DeleteIcon />}
                            onClick={(e) => handleDelete(row.original._id)}
                            aria-label="Delete"
                            size="sm"
                            colorScheme="red"
                        />
                    </HStack>
                ),
            },
        ],
        [router]
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDelete = async (id) => {
        try {
            // Perform delete action on the backend
            await axios.delete(`http://localhost:5000/enquiry/${id}`);

            // Optimistically update the query cache to remove the deleted item from the table
            queryClient.invalidateQueries(["enquiries"]);

            // Optionally, show a success message
            alert("Enquiry deleted successfully.");
        } catch (error) {
            console.error("Failed to delete enquiry:", error);
            alert("Failed to delete enquiry. Please try again later.");
        }
    };

    const handleAddFilter = () => {
        if (filters.some(filter => filter.key === "" && filter.value === "")) return; // Prevent adding empty filters
        setFilters([...filters, { key: "", value: "" }]);
    };


    const handleFilterKeyChange = (index, e) => {
        const newFilters = [...filters];
        newFilters[index].key = e.target.value;
        setFilters(newFilters);
    };

    const handleFilterValueChange = (index, e) => {
        const newFilters = [...filters];
        newFilters[index].value = e.target.value;
        setFilters(newFilters);
    };

    const handleRemoveFilter = (index) => {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters);
    };

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data: data || [],
    });

    const handleRowClick = (id) => {
        router.push(`/${id}`);
    };

    // Handling pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        if (!isNaN(newLimit) || newLimit === null) {
            setLimit(newLimit);
        }
    };
    const bgColor = useColorModeValue("gray.100", "gray.900"); // Background for the Box
    const headBg = useColorModeValue("gray.600","gray.400")
    const inputBg = useColorModeValue("white", "gray.700"); // Background for inputs
    const inputBorder = useColorModeValue("gray.300", "gray.600"); // Border color for inputs
    const textColor = useColorModeValue("gray.800", "white"); // Text color
    const headTextColor= useColorModeValue("white","black")
    const tableBg = useColorModeValue("white", "gray.800"); // Background for the table
    const tableHoverBg = useColorModeValue("gray.200", "gray.600"); // Hover color for table rows


    return (
        <Box p={4} bg={bgColor} color={textColor}>
            {/* Pagination and Limit Controls */}
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
                <HStack p={"4"} align="center" justify="center" spacing={4}>
                    <Input
                        placeholder="Search by description"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        width="100%"
                        maxWidth="400px"
                        bg={inputBg}
                        borderColor={inputBorder}
                        color={textColor}
                    />
                    <Button
                        leftIcon={<AddIcon />}
                        onClick={handleAddFilter}
                        colorScheme="blue"
                        size="md"
                        p="5"
                        px="8"
                    >
                        Add Filter
                    </Button>
                </HStack>
                <HStack p="4">
                    <Button
                        leftIcon={<ChevronLeftIcon />}
                        colorScheme="teal"
                        onClick={() => handlePageChange(page - 1)}
                        isDisabled={page === 1}
                    />
                    <Input
                        placeholder={page.toString()}
                        w="100px"
                        value={page}
                        onChange={(e) => handlePageChange(Number(e.target.value))}
                        type="number"
                        bg={inputBg}
                        borderColor={inputBorder}
                        color={textColor}
                    />
                    <Button
                        rightIcon={<ChevronRightIcon />}
                        colorScheme="teal"
                        onClick={() => handlePageChange(page + 1)}
                    />
                    <Text>Limit:</Text>
                    <Input
                        w="100px"
                        value={limit}
                        onChange={handleLimitChange}
                        type="number"
                        placeholder={limit.toString()}
                        bg={inputBg}
                        borderColor={inputBorder}
                        color={textColor}
                    />
                </HStack>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" placeItems="center">
                {filters.map((filter, index) => (
                    <HStack key={index} mb={2} alignItems="center">
                        <Select
                            placeholder="Select filter key"
                            value={filter.key}
                            onChange={(e) => handleFilterKeyChange(index, e)}
                            width="200px"
                            bg={inputBg}
                            borderColor={inputBorder}
                            color={textColor}
                        >
                            <option value="studentFirstName">Student Name</option>
                            <option value="grade">Grade</option>
                            <option value="guardianName">Guardian</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="city">City</option>
                            <option value="state">State</option>
                            <option value="country">Country</option>
                        </Select>
                        <Input
                            placeholder="Enter filter value"
                            value={filter.value}
                            onChange={(e) => handleFilterValueChange(index, e)}
                            width="200px"
                            bg={inputBg}
                            borderColor={inputBorder}
                            color={textColor}
                        />
                        <IconButton
                            icon={<CloseIcon />}
                            onClick={() => handleRemoveFilter(index)}
                            aria-label="Remove Filter"
                            size="sm"
                            colorScheme="red"
                        />
                    </HStack>
                ))}
            </Box>

            {isLoading ? (
                <Spinner size="lg" />
            ) : isError ? (
                <Text color="red.500">Error fetching data. Please try again later.</Text>
            ) : data && data.length === 0 ? (
                <Text>No data found</Text>
            ) : (
                <TableContainer>
                    <Table {...getTableProps()} bg={tableBg} >
                        <Thead>
                            {headerGroups.map((headerGroup) => (
                                <Tr {...headerGroup.getHeaderGroupProps()} bg={headBg}
                                >
                                    {headerGroup.headers.map((column) => (
                                        <Th {...column.getHeaderProps()} color={headTextColor}>{column.render("Header")}</Th>
                                    ))}
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
                                    >
                                        {row.cells.map((cell) => (
                                            <Td {...cell.getCellProps()}
                                            maxW="300px"
                                            overflow='hidden'
        textOverflow="ellipsis"
                                            
                                            >{cell.render("Cell")}</Td>
                                        ))}
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
