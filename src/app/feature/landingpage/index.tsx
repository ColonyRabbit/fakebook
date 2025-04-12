import React from "react";
import PostCreator from "./components/PostCreator";
import Feet from "./components/Feet";

const IndexLandingPage = () => {
  return (
    <div className="flex flex-col   light:bg-gray-100">
      <PostCreator />
      <Feet />
    </div>
  );
};

export default IndexLandingPage;
