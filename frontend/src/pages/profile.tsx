import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

import Header from "../components/Header.tsx";
import PersonalInfo from "../components/Profile.tsx";

function Profile(): React.ReactElement {
  return (
    <ChakraProvider>
      <Header />
      <PersonalInfo />
    </ChakraProvider>
  );
}

export default Profile;
