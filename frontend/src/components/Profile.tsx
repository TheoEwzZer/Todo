import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  useToast,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

export default function Profile(): React.ReactElement {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [id, setId] = useState("");
  const toast = useToast();
  const [oldEmail, setOldEmail] = useState("");

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
      setFirstname(data.firstname);
      setName(data.name);
      setEmail(data.email);
      setOldEmail(data.email);
      setId(data.id);
    };
    fetchUser();
  }, []);

  const handleEditEmail: () => void = (): void => {
    setIsEditingEmail(true);
  };

  const handleEditPassword: () => void = (): void => {
    setIsEditingPassword(true);
  };

  const handleSaveEmail: () => void = async (): Promise<void> => {
    setIsEditingEmail(false);

    const response = await fetch(`http://localhost:8000/users/email/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({
        email: email,
      }),
    });
    const data: any = await response.json();
    if (response.status !== 200) {
      toast({
        title: "There was a problem",
        description: data.detail,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setEmail(oldEmail);
      return;
    }
  };

  const handleSavePassword: () => void = async (): Promise<void> => {
    setIsEditingPassword(false);

    const response = await fetch(`http://localhost:8000/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({
        firstname: firstname,
        name: name,
        email: email,
        password: password,
      }),
    });
    const data: any = await response.json();
    if (response.status !== 200) {
      toast({
        title: "There was a problem",
        description: data.detail,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setPassword("");
      return;
    }
  };

  return (
    <Card align="center">
      <CardHeader>
        <Heading size="md">My Personal Informations</Heading>
      </CardHeader>
      <CardBody>
        <FormControl mb={2}>
          <FormLabel>Last Name</FormLabel>
          <Input
            aria-label="Last Name"
            readOnly
            type="text"
            value={name}
            variant="filled"
          />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>First Name</FormLabel>
          <Input
            aria-label="First Name"
            readOnly
            type="text"
            value={firstname}
            variant="filled"
          />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Email</FormLabel>
          <InputGroup>
            <Input
              aria-label="Email"
              readOnly={!isEditingEmail}
              type="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                setEmail(event.target.value)
              }
              variant={isEditingEmail ? "" : "filled"}
            />
            {!isEditingEmail ? (
              <Button onClick={handleEditEmail} leftIcon={<EditIcon />}>
                Edit
              </Button>
            ) : (
              <Button
                onClick={(): void => handleSaveEmail()}
                leftIcon={<EditIcon />}
              >
                Save
              </Button>
            )}
          </InputGroup>
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              aria-label="Password"
              readOnly={!isEditingPassword}
              type="password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                setPassword(event.target.value)
              }
              variant={isEditingPassword ? "" : "filled"}
            />
            {!isEditingPassword ? (
              <Button onClick={handleEditPassword} leftIcon={<EditIcon />}>
                Edit
              </Button>
            ) : (
              <Button
                onClick={(): void => handleSavePassword()}
                leftIcon={<EditIcon />}
              >
                Save
              </Button>
            )}
          </InputGroup>
        </FormControl>
      </CardBody>
      <CardFooter>
        <Button colorScheme="blue">Ectazium</Button>
      </CardFooter>
    </Card>
  );
}
