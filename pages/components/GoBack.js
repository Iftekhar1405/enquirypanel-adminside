// components/GoBackButton.js
import { IconButton} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {ChevronLeftIcon} from "@chakra-ui/icons";

const GoBackButton = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.back(); // Navigate back to the previous page
    };

    return (
        <  IconButton
            icon={<ChevronLeftIcon/>}
                onClick={handleGoBack}
                     aria-label="Go Back"
                     size="sm"
                     colorScheme="transparent"
            variant="outline"


        />
    );
};

export default GoBackButton;
