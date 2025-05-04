import React from "react";
import PostCreator from "./components/PostCreator";
import Feed from "./components/Feed";
import SideBarUserList from "../../../components/SideBarUserList";

const IndexLandingPage = () => {
  return (
    <div className="relative w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="flex flex-col space-y-6">
          <PostCreator />
          <Feed />
        </div>
      </div>
      <aside className="fixed top-24 right-6 w-[260px] hidden xl:block">
        <SideBarUserList />
      </aside>
    </div>
  );
};

export default IndexLandingPage;
