import React, { useState, ChangeEvent } from "react";
import {
  Heading,
  Flex,
  Box,
  Spacer,
  ButtonGroup,
  Button,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  ModalFooter,
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

  const newUser = {
    email: email,
    password: password,
    name: name,
    firstname: firstname,
  };

  const handleSubmit: () => Promise<void> = async (): Promise<void> => {
    if (!email || !password || !name || !firstname) {
      return;
    }
    const response = await fetch(`http://localhost:8000/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (response.status !== 201) {
      onClose();
      setEmail("");
      setPassword("");
      setName("");
      setFirstname("");
      return;
    }
    const data: any = await response.json();
    localStorage.setItem("jwtToken", data.token);
    onClose();
    setEmail("");
    setPassword("");
    setName("");
    setFirstname("");
    window.location.reload();
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        Sign Up
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Input
                mb={2}
                type="text"
                placeholder="Name"
                aria-label="Name"
                value={name}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  setName(event.target.value)
                }
              />
              <Input
                mb={2}
                type="text"
                placeholder="Firstname"
                aria-label="Firstname"
                value={firstname}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  setFirstname(event.target.value)
                }
              />
              <Input
                mb={2}
                type="email"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  setEmail(event.target.value)
                }
              />
              <Input
                mb={2}
                type="password"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  setPassword(event.target.value)
                }
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button h="1.5rem" size="sm" onClick={handleSubmit}>
              Sign Up
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function Login(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = {
    email: email,
    password: password,
  };

  const handleSubmit: () => Promise<void> = async (): Promise<void> => {
    if (!email || !password) {
      return;
    }
    const response = await fetch(`http://localhost:8000/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginUser),
    });
    const data: any = await response.json();
    if (response.status !== 200) {
      onClose();
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

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        Sign In
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Input
                mb={2}
                type="email"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  setEmail(event.target.value)
                }
              />
              <Input
                mb={2}
                type="password"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  setPassword(event.target.value)
                }
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button h="1.5rem" size="sm" onClick={handleSubmit}>
              Sign Up
            </Button>
          </ModalFooter>
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
      DEV ONLY: Clear localStorage
    </Button>
  );
}

export default Header;
