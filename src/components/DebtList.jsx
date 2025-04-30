import React, { useEffect, useState } from "react";
import Search from "./search/Search";

function DebtList() {
  const [debts, setDebts] = useState([]);
  const [searchterm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch()
      .then((res) => res.json)
      .then((data) => {
        console.log(data);
        setDebts(data);
      });
  });
  function handleSearch(term) {
    setSearchTerm(term);
    const filtered = debts.filter((debt) =>
      debt.name.toLowerCase().includes(term.toLowerCase())
    );
    setDebts(filtered);
  }

  return (
    <div>
      <Search handleSearch={handleSearch} />
      {debts.map((debt) => (
        <DebtItem key={debt.id} debt={debt} />
      ))}
    </div>
  );
}

export default DebtList;
