import { ChevronLeftIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Spacer,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LuLogOut } from "react-icons/lu";

const Navbar = ({ back }) => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clears the token from local storage
    router.push("/login"); // Redirect to login page
  };

  // Function to check if the link is active
  const isActive = (path) => router.pathname === path;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100%"
      bgGradient="linear(to-r, gray.900, gray.800)"
      boxShadow="lg"
      px={6}
      py={4}
      borderBottom="1px solid"
      borderColor="gray.700"
      zIndex={10}
    >
      <Flex alignItems="center">
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label="Back"
          bg="gray.800"
          color="white"
          _hover={{
            bg: "gray.700",
          }}
          border="1px solid"
          borderColor="gray.600"
          boxShadow="lg"
          isDisabled={back === ""}
          onClick={() => router.back()}
        />

        {/* Title */}
        <Text
          ml={4}
          fontSize="xl"
          fontWeight="bold"
          color="white"
          textShadow="0 0 5px rgba(255,255,255,0.5)"
        >
          Enquiries
        </Text>

        <Spacer />

        {/* Nav Links */}
        <HStack gap={5}>
          <Link
            href="/"
            fontSize="md"
            fontWeight="medium"
            textDecoration="none"
            _hover={{
              textDecoration: "underline",
              color: "gray.300",
            }}
          >
            Home
          </Link>

          {/* <Link
            href="/about"
            fontSize="md"
            fontWeight="medium"
            color={isActive("/about") ? "red.400" : "white"}
            textDecoration={isActive("/about") ? "underline" : "none"}
            _hover={{
              textDecoration: "underline",
              color: "gray.300",
            }}
          >
            About
          </Link> */}
          <Link
            href="/dashboard"
            fontSize="md"
            fontWeight="medium"
            color={isActive("/dashboard") ? "red.400" : "white"}
            textDecoration={isActive("/dashboard") ? "underline" : "none"}
            _hover={{
              textDecoration: "underline",
              color: "gray.300",
            }}
          >
            Dashboard
          </Link>
          <IconButton
            onClick={toggleColorMode}
            bg="gray.800"
            color="white"
            _hover={{
              bg: "gray.700",
            }}
            border="1px solid"
            borderColor="gray.600"
            boxShadow="lg"
          >
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          <IconButton
            icon={<LuLogOut />}
            onClick={handleLogout}
            bg="gray.800"
            color="white"
            _hover={{
              bg: "gray.700",
            }}
            border="1px solid"
            borderColor="gray.600"
            boxShadow="lg"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
