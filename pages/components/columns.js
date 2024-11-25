const columns = React.useMemo(
  () => [
    { Header: "Description", accessor: "description", id: "description" },
    { Header: "Student Name", accessor: "studentFirstName" },
    { Header: "Grade", accessor: "grade" },
    { Header: "Gender", accessor: "gender" },
    { Header: "Hostel", accessor: "hostel" },
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
      ),
    },
  ],
  [router]
);
