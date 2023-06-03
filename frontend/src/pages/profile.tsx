import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

import Todos from "../components/Todo.tsx";
import Header from "../components/Header.tsx";

function Profile(): React.ReactElement {
  return (
    <ChakraProvider>
      <Header />
      <Todos />
    </ChakraProvider>
  );
}

export default Profile;
