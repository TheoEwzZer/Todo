import React from "react";
import {
  Heading,
  Flex,
  Box,
  Spacer,
  ButtonGroup,
  Button,
  Image,
} from "@chakra-ui/react";

const Header: () => React.JSX.Element = (): React.JSX.Element => (
  <Box>
    <Flex as="nav" bg="gray.600" height="80px" alignItems="center">
      <Spacer />
      <Box p="2">
        <Heading size="md">Todo Manager</Heading>
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Button colorScheme="teal">Sign Up</Button>
        <Button colorScheme="teal">Log in</Button>
      </ButtonGroup>
      <Spacer />
    </Flex>
    <Image
      src="https://c0.wallpaperflare.com/preview/516/233/193/writing-postcard-letter-pen.jpg"
      alt="Todo Manager"
      width="100%"
      height="300px"
    />
  </Box>
);

export default Header;
