import React, {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

interface SortArrowProps {
  direction: "asc" | "desc";
}

const SortArrow: ({ direction }: SortArrowProps) => React.ReactElement = ({
  direction,
}: SortArrowProps): React.ReactElement => {
  return (
    <Box as="span" ml="2">
      {direction === "asc" ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </Box>
  );
};

const TodosContext: React.Context<{ todos: never[]; fetchTodos: () => void }> =
  React.createContext({
    todos: [],
    fetchTodos: (): void => {},
  });

interface Todo {
  id: string;
  title: string;
  description: string;
  created_at: string;
  due_time: string;
  status: string;
}

export default function Todos(): React.ReactElement {
  const [todos, setTodos] = useState([]);
  const [sortColumn, setSortColumn] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const fetchTodos: () => Promise<void> = async (): Promise<void> => {
    const token: string | null = localStorage.getItem("jwtToken");
    if (!token) {
      return;
    }
    const response = await fetch("http://localhost:8000/user/todos", {
      headers: { token: token },
    });
    const todos: React.SetStateAction<never[]> = await response.json();
    if (response.status !== 200) {
      return;
    }
    setTodos(todos);
  };

  const sortTodos: (column: string) => void = (column: string): void => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTodos: Todo[] = useMemo((): Todo[] => {
    return [...todos].sort((a: Todo, b: Todo): 1 | -1 | 0 => {
      const columnA: string = a[sortColumn as keyof Todo];
      const columnB: string = b[sortColumn as keyof Todo];
      if (columnA < columnB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (columnA > columnB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [todos, sortColumn, sortDirection]);

  useEffect((): void => {
    fetchTodos();
  }, []);
  if (!localStorage.getItem("jwtToken")) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh">
        <Box textAlign="center">
          <Text fontSize="4xl" fontWeight="bold">
            Sign In to use Todos
          </Text>
        </Box>
      </Flex>
    );
  }
  return (
    <TodosContext.Provider value={{ todos, fetchTodos }}>
      <AddTodo />
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th onClick={(): void => sortTodos("id")}>
              id{" "}
              {sortColumn === "id" && <SortArrow direction={sortDirection} />}
            </Th>
            <Th onClick={(): void => sortTodos("title")}>
              Title{" "}
              {sortColumn === "title" && (
                <SortArrow direction={sortDirection} />
              )}
            </Th>
            <Th onClick={(): void => sortTodos("description")}>
              Description{" "}
              {sortColumn === "description" && (
                <SortArrow direction={sortDirection} />
              )}
            </Th>
            <Th onClick={(): void => sortTodos("created_at")}>
              Created At{" "}
              {sortColumn === "created_at" && (
                <SortArrow direction={sortDirection} />
              )}
            </Th>
            <Th onClick={(): void => sortTodos("due_time")}>
              Due Time{" "}
              {sortColumn === "due_time" && (
                <SortArrow direction={sortDirection} />
              )}
            </Th>
            <Th onClick={(): void => sortTodos("status")}>
              Status{" "}
              {sortColumn === "status" && (
                <SortArrow direction={sortDirection} />
              )}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedTodos.map(
            (todo: Todo): React.ReactElement => (
              <Tr key={todo.id}>
                <Td>{todo.id}</Td>
                <Td>{todo.title}</Td>
                <Td>{todo.description}</Td>
                <Td>{todo.created_at}</Td>
                <Td>{todo.due_time}</Td>
                <Td>{todo.status}</Td>
                <Td>
                  <ButtonGroup>
                    <UpdateTodo {...todo} />
                    <DeleteTodo {...todo} />
                  </ButtonGroup>
                </Td>
              </Tr>
            )
          )}
        </Tbody>
      </Table>
    </TodosContext.Provider>
  );
}

function UpdateTodo({
  id,
  title,
  description,
  status,
  due_time,
}: {
  id: string;
  title: string;
  description: string;
  status: string;
  due_time: string;
}): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);
  const [newStatus, setNewStatus] = useState(status);
  const [newDueTime, setNewDueTime] = useState(due_time);
  const { fetchTodos } = React.useContext(TodosContext);
  const [errorMessage, setErrorMessage] = useState("");
  if (!localStorage.getItem("jwtToken")) {
    return <></>;
  }

  const handleUpdate: () => Promise<void> = async (): Promise<void> => {
    if (!newTitle || !newDueTime || !newStatus) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    const token: string | null = localStorage.getItem("jwtToken");
    if (!token) {
      return;
    }
    const response = await fetch(`http://localhost:8000/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({
        id: id,
        title: newTitle,
        description: newDescription,
        status: newStatus,
        due_time: newDueTime,
      }),
    });
    if (response.status !== 200) {
      const data: any = await response.json();
      setErrorMessage(data.message);
      setNewTitle(title);
      setNewDescription(description);
      setNewStatus(status);
      setNewDueTime(due_time);
      return;
    }
    onClose();
    fetchTodos();
  };

  const handleKeyDown: (e: any) => void = (e: any): void => {
    if (e.keyCode === 13) {
      handleUpdate();
    }
  };

  const close: () => void = (): void => {
    onClose();
    setErrorMessage("");
  };

  return (
    <>
      <Button colorScheme="blue" onClick={onOpen}>
        Edit
      </Button>
      <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={close}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit {title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column">
              <FormControl mb={2} isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  type="text"
                  aria-label="Title"
                  value={newTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setNewTitle(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormControl mb={2}>
                <FormLabel>Description</FormLabel>
                <Input
                  type="text"
                  aria-label="Description"
                  value={newDescription}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setNewDescription(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>Status</FormLabel>
                <RadioGroup
                  defaultValue="not started"
                  mb={2}
                  value={newStatus}
                  onChange={(event: string): void => setNewStatus(event)}
                  onKeyDown={handleKeyDown}
                >
                  <HStack spacing="24px">
                    <Radio value="not started">Not Started</Radio>
                    <Radio value="todo">Todo</Radio>
                    <Radio value="in progress">In Progress</Radio>
                    <Radio value="done">Done</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>Due Time</FormLabel>
                <Input
                  mb={2}
                  type="datetime-local"
                  aria-label="Due Time"
                  value={newDueTime}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setNewDueTime(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              h="1.5rem"
              size="sm"
              colorScheme="blue"
              onClick={handleUpdate}
            >
              Edit
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

function DeleteTodo({ id }: { id: string }): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fetchTodos } = React.useContext(TodosContext);
  const token: string | null = localStorage.getItem("jwtToken");
  if (!token) {
    return <></>;
  }
  const handleDelete: () => Promise<void> = async (): Promise<void> => {
    await fetch(`http://localhost:8000/todos/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({ id: id }),
    });
    onClose();
    fetchTodos();
  };
  return (
    <>
      <Button colorScheme="red" onClick={onOpen}>
        Delete
      </Button>
      <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this todo?</Text>
          </ModalBody>

          <ModalFooter>
            <Button
              h="1.5rem"
              size="sm"
              colorScheme="red"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function AddTodo(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [dueTime, setDueTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { fetchTodos } = React.useContext(TodosContext);
  const initialRef: MutableRefObject<null> = React.useRef(null);

  if (!localStorage.getItem("jwtToken")) {
    return <></>;
  }

  const handleSubmit: () => Promise<void> = async (): Promise<void> => {
    if (!title || !status || !dueTime) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (!localStorage.getItem("jwtToken")) {
      return;
    }

    const token: string | null = localStorage.getItem("jwtToken");
    if (!token) {
      return;
    }

    const response = await fetch("http://localhost:8000/users", {
      method: "GET",
      headers: { token: token },
    });
    const data: any = await response.json();
    if (response.status !== 201) {
      setErrorMessage(data.detail);
      setTitle("");
      setDescription("");
      setStatus("not started");
      return;
    }

    const newTodo = {
      title: title,
      description: description,
      due_time: dueTime,
      status: status,
      user_id: data.id,
    };

    await fetch(`http://localhost:8000/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify(newTodo),
    });
    onClose();
    fetchTodos();
    setTitle("");
    setDescription("");
    setStatus("not started");
  };

  const handleKeyDown: (e: any) => void = (e: any): void => {
    if (e.keyCode === 13) {
      handleSubmit();
    }
  };

  const close: () => void = (): void => {
    onClose();
    setTitle("");
    setDescription("");
    setStatus("not started");
    setErrorMessage("");
  };

  return (
    <>
      <Button
        colorScheme="green"
        onClick={onOpen}
        width={["100%"]}
        borderRadius="0"
      >
        Create new task
      </Button>
      <Modal
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={close}
        initialFocusRef={initialRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column">
              <FormControl mb={2} isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  ref={initialRef}
                  type="text"
                  aria-label="Title"
                  value={title}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setTitle(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormControl mb={2}>
                <FormLabel>Description</FormLabel>
                <Input
                  type="text"
                  aria-label="Description"
                  value={description}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setDescription(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>Status</FormLabel>
                <RadioGroup
                  defaultValue="not started"
                  mb={2}
                  value={status}
                  onChange={(event: string): void => setStatus(event)}
                  onKeyDown={handleKeyDown}
                >
                  <HStack spacing="24px">
                    <Radio value="not started">Not Started</Radio>
                    <Radio value="todo">Todo</Radio>
                    <Radio value="in progress">In Progress</Radio>
                    <Radio value="done">Done</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <FormControl mb={2} isRequired>
                <FormLabel>Due Time</FormLabel>
                <Input
                  mb={2}
                  type="datetime-local"
                  aria-label="Due Time"
                  value={dueTime}
                  onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                    setDueTime(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              h="1.5rem"
              size="sm"
              colorScheme="green"
              onClick={handleSubmit}
            >
              Create new task
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
