import React from "react";
import PostCreator from "./components/PostCreator";
import Feed from "./components/Feed";

const IndexLandingPage = () => {
  return (
    <div className="flex flex-col   light:bg-gray-100">
      <PostCreator />
      <Feed />
    </div>
  );
};

export default IndexLandingPage;
