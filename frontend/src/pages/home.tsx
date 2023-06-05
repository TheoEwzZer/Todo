import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import Header from "../components/Header.tsx";
import HomeImage from "../components/HomeImage.tsx";
import Todos from "../components/Todo.tsx";

function Home(): React.ReactElement {
  return (
    <ChakraProvider>
      <Header />
      <HomeImage />
      <Todos />
    </ChakraProvider>
  );
}

export default Home;
