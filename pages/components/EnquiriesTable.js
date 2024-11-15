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
} from "@chakra-ui/icons";

// Fetch enquiries data with filters


export default function EnquiriesTable() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [filters, setFilters] = useState([]); // To store multiple filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [fetch,setFetch] = useState(true)


    const fetchEnquiries = async (searchTerm, filters, page, limit) => {
        const params = {
            searchTerm: searchTerm || "", // Pass the search term directly
            value: searchTerm,
            filters: filters ? JSON.stringify(filters) : "[]", // Ensure filters are a valid JSON string
            page,
            limit,
        };

        const res = await axios.get("http://localhost:5000/enquiry/search", { params });
        setFetch(false)
        return res.data;
    };

    // Debounce the search input to avoid refetching on every keystroke
    useEffect(() => {
        const handler = debounce(() => setDebouncedSearchTerm(searchTerm), 300);
        handler();
        return () => handler.cancel();
    }, [searchTerm]);

    // Pass debouncedSearchTerm and filters to fetchEnquiries
    const validFilters = filters.filter((f) => f.key && f.value); // Only keep filters with both key and value

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["enquiries", debouncedSearchTerm, filters, page, limit],
        queryFn: () => fetchEnquiries(debouncedSearchTerm, filters, page, limit),
        enabled: fetch || validFilters.length > 0 || searchTerm !== '',
                    });

    const columns = React.useMemo(
        () => [
            { Header: "Description", accessor: "description" },
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
                    <Button
                        colorScheme="teal"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/edit/${row.original._id}`);
                        }}
                    >
                        Edit
                    </Button>
                ),
            },
        ],
        [router]
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddFilter = () => {
        setFilters([...filters, { key: "", value: "" }]); // Add an empty filter object
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
        if (!isNaN(newLimit)||newLimit===null) {
            setLimit(newLimit);
        }
    };

    return (
        <Box p={4}>


            {/* Pagination and Limit Controls */}
            <Box display="flex" alignItems="center" justifyContent="space-between" p={4} borderWidth={1} borderRadius="md">

                    <Input
                        placeholder="Search by description"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        mb={4}
                        width="100%"
                        maxWidth="400px"
                    />

                    <Button leftIcon={<AddIcon />} onClick={handleAddFilter} colorScheme="blue" size="sm">
                        Add Filter
                    </Button>
                <HStack p='4'>
                    <Button
                        leftIcon={<ChevronLeftIcon />}
                        colorScheme="teal"
                        onClick={() => handlePageChange(page - 1)}
                        isDisabled={page === 1}
                    >

                    </Button>

                    <Input
                        placeholder={page.toString()}
                        w="100px"
                        value={page}
                        onChange={(e) => handlePageChange(Number(e.target.value))}
                        type="number"
                    />

                    <Button
                        rightIcon={<ChevronRightIcon />}
                        colorScheme="teal"
                        onClick={() => handlePageChange(page + 1)}
                    >

                    </Button>

                    <Text>Limit:</Text>
                    <Input
                        w="100px"
                        value={limit}
                        onChange={handleLimitChange}
                        type="number"
                        placeholder={limit.toString()}
                    />
                </HStack>
            </Box>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" placeItems='center'>
                {filters.map((filter, index) => (
                    <HStack key={index} mb={2} alignItems="center">
                        <Select
                            placeholder="Select filter key"
                            value={filter.key}
                            onChange={(e) => handleFilterKeyChange(index, e)}
                            width="200px"
                            sx={{
                                'option': {
                                    backgroundColor: 'gray.700', // Set the background color of options
                                    color: 'white', // Set the text color of options
                                    _hover: {
                                        backgroundColor: 'gray.600', // Set hover background color
                                    },
                                },
                            }}
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
            {/* Loading Spinner or Data */}
            {isLoading ? (
                <Spinner size="lg" />
            ) : isError ? (
                <Text color="red.500">Error fetching data. Please try again later.</Text>
            ) : (
                <Box overflowX="auto">
                    <Table {...getTableProps()} variant="simple" size="md">
                        <Thead>
                            {headerGroups.map((headerGroup) => (
                                <Tr {...headerGroup.getHeaderGroupProps()} bg="gray.700" color="white">
                                    {headerGroup.headers.map((column) => (
                                        <Th
                                            {...column.getHeaderProps()}
                                            py={3}
                                            px={4}
                                            textAlign="left"
                                            fontSize="sm"
                                            whiteSpace="nowrap"
                                        >
                                            {column.render("Header")}
                                        </Th>
                                    ))}
                                </Tr>
                            ))}
                        </Thead>
                        <Tbody {...getTableBodyProps()} bg="gray.800">
                            {rows.map((row) => {
                                prepareRow(row);
                                return (
                                    <Tr
                                        {...row.getRowProps()}
                                        key={row.original._id}
                                        onClick={() => handleRowClick(row.original._id)}
                                        cursor="pointer"
                                        _hover={{ bg: "gray.600" }}
                                    >
                                        {row.cells.map((cell) => (
                                            <Td
                                                {...cell.getCellProps()}
                                                py={3}
                                                px={4}
                                                fontSize="sm"
                                                lineHeight="short"
                                                whiteSpace="normal"
                                                maxW="500px"
                                                minW='100px'
                                                overflowX='auto'
                                            >
                                                {cell.render("Cell")}
                                            </Td>
                                        ))}
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
}
