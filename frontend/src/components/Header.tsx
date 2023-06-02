import React, { ChangeEvent, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  Image,
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
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { InfoOutlineIcon, QuestionOutlineIcon } from "@chakra-ui/icons";

const Header: () => React.JSX.Element = (): React.JSX.Element => (
  <Box>
    <Flex as="nav" bg="gray.600" height="80px" alignItems="center">
      <Spacer />
      <Box p="2">
        <Heading size="md">Todo Manager</Heading>
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Register />
        <Login />
        <ClearLocalStorageButton />
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

function Register(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = React.useState(false);

  const handleClick: () => void = (): void => setShow(!show);

  const newUser = {
    email: email,
    password: password,
    name: name,
    firstname: firstname,
  };

  const handleSubmit: () => Promise<void> = async (): Promise<void> => {
    if (!email || !password || !name || !firstname) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    const response = await fetch(`http://localhost:8000/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data: any = await response.json();
    if (response.status !== 201) {
      setErrorMessage(data.detail);
      setEmail("");
      setPassword("");
      return;
    }
    localStorage.setItem("jwtToken", data.token);
    onClose();
    setEmail("");
    setPassword("");
    setName("");
    setFirstname("");
    window.location.reload();
  };

  const close: () => void = (): void => {
    onClose();
    setEmail("");
    setPassword("");
    setName("");
    setFirstname("");
    setErrorMessage("");
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        Sign Up
      </Button>
      <Modal isOpen={isOpen} onClose={close}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <FormControl mb={2} isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  type="text"
                  aria-label="Last Name"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setName(event.target.value)
                  }
                />
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  type="text"
                  aria-label="First Name"
                  value={firstname}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setFirstname(event.target.value)
                  }
                />
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  aria-label="Email"
                  value={email}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setEmail(event.target.value)
                  }
                />
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="At least 6 characters"
                    aria-label="Password"
                    value={password}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                      setPassword(event.target.value)
                    }
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Flex alignItems="center" ml={2}>
                  <Icon mt={2} as={InfoOutlineIcon} color="gray.500" mr={2} />
                  <FormHelperText>
                    Passwords must be at least 6 characters.
                  </FormHelperText>
                </Flex>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button h="1.5rem" size="sm" onClick={handleSubmit}>
              Sign Up
            </Button>
          </ModalFooter>
          {errorMessage && (
            <Alert
              status="error"
              flexDirection="column"
              borderBottomLeftRadius={5}
              borderBottomRightRadius={5}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                There was a problem
              </AlertTitle>
              <AlertDescription maxWidth="sm">{errorMessage}</AlertDescription>
            </Alert>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function Login(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = React.useState(false);

  const handleClick: () => void = (): void => setShow(!show);

  const loginUser = {
    email: email,
    password: password,
  };

  const handleSubmit: () => Promise<void> = async (): Promise<void> => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    const response = await fetch(`http://localhost:8000/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginUser),
    });
    const data: any = await response.json();
    if (response.status !== 200) {
      setErrorMessage(data.detail);
      setEmail("");
      setPassword("");
      return;
    }
    localStorage.setItem("jwtToken", data.token);
    onClose();
    setEmail("");
    setPassword("");
    window.location.reload();
  };

  const close: () => void = (): void => {
    onClose();
    setEmail("");
    setPassword("");
    setErrorMessage("");
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        Sign In
      </Button>
      <Modal isOpen={isOpen} onClose={close}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <FormControl mb={2}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  aria-label="Email"
                  value={email}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setEmail(event.target.value)
                  }
                />
              </FormControl>
              <FormControl mb={2}>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="Password"
                    aria-label="Password"
                    value={password}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                      setPassword(event.target.value)
                    }
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button h="1.5rem" size="sm" onClick={handleSubmit}>
              Sign Up
            </Button>
          </ModalFooter>
          {errorMessage && (
            <Alert
              status="error"
              flexDirection="column"
              borderBottomLeftRadius={5}
              borderBottomRightRadius={5}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                There was a problem
              </AlertTitle>
              <AlertDescription maxWidth="sm">{errorMessage}</AlertDescription>
            </Alert>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function ClearLocalStorageButton(): React.ReactElement {
  const handleClearLocalStorage: () => void = (): void => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Button colorScheme="red" onClick={handleClearLocalStorage}>
      Sign Out
    </Button>
  );
}

export default Header;
