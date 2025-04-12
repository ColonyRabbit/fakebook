"use client";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import { Search as SearchIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
//define the props for the search results
export interface SearchResultsProps {
  id: string;
  username: string;
  name?: string;
  photo?: string;
}
const Search = () => {
  //usePathname
  const pathName = usePathname();
  // local state
  const [searchText, setSearchText] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResultsProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ค้นหาผู้ใช้
  useEffect(() => {
    const handleSearch = async () => {
      if (searchText.trim() === "") {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            searchText: searchText,
          }),
        });
        const data = await response.json();
        setSearchResults(data);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchText.length > 0) handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [pathName, searchText]);
  //function
  const handleClearSearchText = () => {
    setSearchText("");
    setIsDropdownOpen(false);
  };
  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="w-4 h-4 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => searchText.length > 0 && setIsDropdownOpen(true)}
          placeholder="ค้นหาผู้ใช้..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isDropdownOpen && searchResults.length > 0 && searchText && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 ease-in-out"
        >
          <div className="max-h-60 overflow-y-auto">
            {searchResults.map((user) => (
              <Link
                onClick={handleClearSearchText}
                href={`/profile/${user!.username}`}
                key={user.id}
              >
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0">
                  {user.photo ? (
                    <Image
                      width={40}
                      height={40}
                      src={user.photo}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {user.username}
                    </span>
                    {user.name && (
                      <span className="text-sm text-gray-500">{user.name}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isDropdownOpen &&
        searchText.length > 0 &&
        searchResults.length === 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg border border-gray-200 p-4 text-center text-gray-500"
          >
            ไม่พบผู้ใช้ที่ตรงกับ {searchText}
          </div>
        )}
    </div>
  );
};

export default Search;
