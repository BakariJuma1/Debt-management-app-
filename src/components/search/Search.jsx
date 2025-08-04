import React from "react";
import { FiSearch } from "react-icons/fi";

function Search({ handleSearch }) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-4" >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search debt..."
          onChange={(e) => handleSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          aria-label="Search debts"
        />
      </div>
    </div>
  );
}

export default Search;