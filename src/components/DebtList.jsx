import React, { useEffect, useState } from "react";
import axios from "axios";
import Search from "./search/Search";
import DebtTable from "./debttable/DebtTable";
import API_BASE_URL from "../api";
import { useAuth } from "../AuthProvider"; // Import useAuth

function DebtList() {
  const [debts, setDebts] = useState([]);
  const [allDebts, setAllDebts] = useState([]);
  const [searchterm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated } = useAuth(); // Get auth info

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDebts = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = `${API_BASE_URL}/debts`;

        // Add query parameter for salespersons to only get their debts
        if (user.role === "salesperson") {
          url = `${API_BASE_URL}/debts`; // Backend handles filtering by created_by
        }

        const response = await axios.get(url, {
          signal: signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        setDebts(response.data);
        setAllDebts(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Axios error:", err);
          if (err.response?.status === 403) {
            setError(
              "Access denied. You don't have permission to view these debts."
            );
          } else {
            setError(err.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDebts();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, user, token]); // Add dependencies

  function handleSearch(term) {
    setSearchTerm(term);
    if (term.trim() === "") {
      setDebts(allDebts);
    } else {
      const filtered = allDebts.filter(
        (debt) =>
          debt.customer_name?.toLowerCase().includes(term.toLowerCase()) || // Changed to customer_name
          debt.status?.toLowerCase().includes(term.toLowerCase())
      );
      setDebts(filtered);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-lg text-gray-700 font-semibold">
          Loading debt details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Please log in to view debts.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {user.role === "salesperson" ? "(My Debts)" : ""}
        </h2>
        {user.role === "salesperson" && (
          <p className="text-sm text-gray-600">
            You can only view debts that you created
          </p>
        )}
      </div>

      {/* <Search handleSearch={handleSearch} /> */}
      <DebtTable
        debts={debts}
        showActions={
          user.role === "owner" ||
          user.role === "admin" ||
          user.role === "salesperson"
        }
      />
    </div>
  );
}

export default DebtList;
