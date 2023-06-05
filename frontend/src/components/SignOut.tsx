import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

export default function LogOut(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogOut: () => void = (): void => {
    localStorage.removeItem("jwtToken");
    window.location.reload();
  };

  return (
    <>
      {location.pathname !== "/profile" ? (
        <Button
          colorScheme="red"
          leftIcon={<CloseIcon />}
          mt={2}
          onClick={onOpen}
          width="100%"
        >
          Sign Out
        </Button>
      ) : (
        <Button
          colorScheme="red"
          leftIcon={<CloseIcon />}
          onClick={onOpen}
          width="100%"
        >
          Sign Out
        </Button>
      )}
      <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Out</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to sign out?</Text>
          </ModalBody>

          <ModalFooter>
            <Button
              h="1.5rem"
              size="sm"
              colorScheme="red"
              onClick={handleLogOut}
            >
              Sign Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
