import {
  ChevronDownIcon,
  InfoOutlineIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";
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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import React, {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useState,
} from "react";
import SignOut from "./SignOut";

async function IsLoggedIn(): Promise<boolean> {
  const token: string | null = localStorage.getItem("jwtToken");
  if (!token) {
    return false;
  }
  const response = await fetch(`http://localhost:8000/check_token`, {
    method: "GET",
    headers: { token: token },
  });
  if (response.status !== 200) {
    return false;
  }
  return true;
}

const Header: () => React.ReactElement = (): React.ReactElement => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect((): void => {
    const checkLoginStatus: () => Promise<void> = async (): Promise<void> => {
      const loggedIn: boolean = await IsLoggedIn();
      setIsLoggedIn(loggedIn);
    };
    checkLoginStatus();
  }, []);

  const handleHome: () => void = (): void => {
    window.location.href = "/";
  };

  const renderLoginButtons: () => React.ReactNode = (): React.ReactNode => {
    if (isLoggedIn) {
      return (
        <ButtonGroup gap="2">
          {location.pathname !== "/" && (
            <Button colorScheme="blue" onClick={handleHome}>
              View my tasks
            </Button>
          )}
          <Profile />
        </ButtonGroup>
      );
    } else {
      return (
        <ButtonGroup gap="2">
          <Register />
          <Login />
        </ButtonGroup>
      );
    }
  };

  return (
    <Box>
      <Flex as="nav" bg="gray.600" height="80px" alignItems="center">
        <Spacer />
        <Box p="2">
          <Heading size="md">Todo Manager</Heading>
        </Box>
        <Spacer />
        {renderLoginButtons()}
        <Spacer />
      </Flex>
    </Box>
  );
};

function Register(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const initialRef: MutableRefObject<null> = React.useRef(null);

  const handleClick: () => void = (): void => setShow(!show);
  const handleClickConfirm: () => void = (): void =>
    setShowConfirm(!showConfirm);

  const newUser = {
    email: email,
    password: password,
    name: name,
    firstname: firstname,
  };

  const handleSubmit: () => Promise<void> = async (): Promise<void> => {
    if (!email || !password || !confirmPassword || !name || !firstname) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setPassword("");
      setConfirmPassword("");
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
      setConfirmPassword("");
      return;
    }
    localStorage.setItem("jwtToken", data.token);
    onClose();
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setFirstname("");
    window.location.reload();
  };

  const handleKeyDown: (e: any) => void = (e: any): void => {
    if (e.keyCode === 13) {
      handleSubmit();
    }
  };

  const close: () => void = (): void => {
    onClose();
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setFirstname("");
    setErrorMessage("");
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        Sign Up
      </Button>
      <Modal
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={close}
        initialFocusRef={initialRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create an account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <FormControl mb={2} isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  ref={initialRef}
                  type="text"
                  aria-label="Last Name"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setName(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    id="password"
                    name="password"
                    type={show ? "text" : "password"}
                    placeholder="At least 6 characters"
                    aria-label="Password"
                    value={password}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                      setPassword(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    autoComplete="new-password"
                    required
                  />
                  <InputRightElement>
                    <IconButton
                      variant="link"
                      aria-label={show ? "Hide" : "Show"}
                      icon={show ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>
                <Flex alignItems="center" ml={2}>
                  <Icon mt={2} as={InfoOutlineIcon} color="gray.500" mr={2} />
                  <FormHelperText>
                    Passwords must be at least 6 characters.
                  </FormHelperText>
                </Flex>
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel htmlFor="confirmPassword">
                  Confirm Password
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    aria-label="Confirm Password"
                    value={confirmPassword}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                      setConfirmPassword(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    autoComplete="new-password"
                    required
                  />
                  <InputRightElement>
                    <IconButton
                      variant="link"
                      aria-label="Confirm Password"
                      icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={handleClickConfirm}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button width="100%" colorScheme="teal" onClick={handleSubmit}>
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
  const initialRef: MutableRefObject<null> = React.useRef(null);

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

  const handleKeyDown: (e: any) => void = (e: any): void => {
    if (e.keyCode === 13) {
      handleSubmit();
    }
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
      <Modal
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={close}
        initialFocusRef={initialRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log in to your account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <FormControl mb={2}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  ref={initialRef}
                  type="email"
                  aria-label="Email"
                  value={email}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setEmail(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormControl mb={2}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    id="password"
                    name="password"
                    type={show ? "text" : "password"}
                    aria-label="Password"
                    value={password}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                      setPassword(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                    required
                  />
                  <InputRightElement>
                    <IconButton
                      variant="link"
                      aria-label={show ? "Hide" : "Show"}
                      icon={show ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button width="100%" colorScheme="teal" onClick={handleSubmit}>
              Sign In
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

function Profile(): React.ReactElement {
  const [firstname, setFirstname] = useState("");

  const token: string | null = localStorage.getItem("jwtToken");
  if (!token) {
    return <></>;
  }

  useEffect((): void => {
    const fetchUser: () => Promise<void> = async (): Promise<void> => {
      const response = await fetch("http://localhost:8000/users", {
        method: "GET",
        headers: { token: token },
      });
      const data: any = await response.json();
      if (response.status !== 200) {
        handleLogOut();
        return;
      }
      setFirstname(data.firstname);
    };
    fetchUser();
  }, []);

  const handleLogOut: () => void = (): void => {
    localStorage.removeItem("jwtToken");
    window.location.reload();
  };

  const handleViewProfile: () => void = (): void => {
    window.location.href = "/profile";
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button rightIcon={<ChevronDownIcon />}>{firstname}</Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="auto">
          <PopoverBody
            alignItems="center"
            display="flex"
            flexDirection="column"
            width="100%"
          >
            {location.pathname !== "/profile" && (
              <Button
                onClick={handleViewProfile}
                leftIcon={<ViewIcon />}
                colorScheme="blue"
              >
                View Profile
              </Button>
            )}
            <SignOut />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

export default Header;
