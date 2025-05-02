import React from "react";
import "../search/search.css";

function Search({ handleSearch }) {
  return (
    <div className="searchContainer">
      <div className="searchWrapper">
        <span className="searchIcon">🔍</span>
        <input
          type="text"
          placeholder="Search debt..."
          onChange={(e) => handleSearch(e.target.value)}
          className="searchInput"
        />
      </div>
    </div>
  );
}

export default Search;
