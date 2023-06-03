import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

import Header from "../components/Header.tsx";
import Todos from "../components/Todo.tsx";

function Home(): React.ReactElement {
  return (
    <ChakraProvider>
      <Header />
      <Todos />
    </ChakraProvider>
  );
}

export default Home;
