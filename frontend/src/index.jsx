import React from "react";
import { render } from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Header from "./components/Header.tsx";
import Todos from "./components/Todo.tsx";

function App() {
  return (
    <ChakraProvider>
      <Header />
      <Todos />
    </ChakraProvider>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
