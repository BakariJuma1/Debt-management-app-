import React, { useEffect, useState } from "react";
import Search from "./search/Search";
import DebtTable from "./debttable/DebtTable";

function DebtList() {
  const [debts, setDebts] = useState([]);
  const [allDebts, setAllDebts] = useState([]);
  const [searchterm, setSearchTerm] = useState("");

  useEffect(() => {
    const controller = new AbortController(); // Create controller

    fetch("http://localhost:3001/debts", { signal: controller.signal }) // Attach signal
      .then((res) => res.json())
      .then((data) => {
        setDebts(data);
        setAllDebts(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      });

    return () => {
      controller.abort(); // Cleanup: cancel fetch if component unmounts
    };
  }, []);

  
  function handleSearch(term) {
    setSearchTerm(term);
    if (term.trim() === "") {
      setDebts(allDebts);
    } else {
      const filtered = debts.filter((debt) =>
        debt.name.toLowerCase().includes(term.toLowerCase())
      );
      setDebts(filtered);
    }
  }

  return (
    <div>
      <Search handleSearch={handleSearch} />

      <DebtTable debts={debts} />
    </div>
  );
}

export default DebtList;
