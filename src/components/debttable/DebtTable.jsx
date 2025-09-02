import React, { useState, useEffect } from "react";
import { FiMoreVertical, FiPlus, FiSearch } from "react-icons/fi";
import { FaHistory, FaTrash, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import Layout from "../layout/Layout";

const statusClasses = {
  Paid: "bg-green-100 text-green-800",
  Partial: "bg-yellow-100 text-yellow-800",
  Unpaid: "bg-red-100 text-red-800",
};

const statusIcons = {
  Paid: "✅",
  Partial: "⏳",
  Unpaid: "⚠️"
};

function DebtTable({ debts = [], showActions = true }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
      })
        .format(amount || 0)
        .replace("KES", "Ksh");
    } catch {
      return `Ksh ${amount || 0}`;
    }
  };

  const getStatus = (debt) => {
    if (debt.status) return debt.status;
    
    const amountPaid = debt.amount_paid || 0;
    const balance = debt.balance || (debt.total - amountPaid);
    
    return balance === 0 ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";
  };

  const getBalance = (debt) => {
    return debt.balance || (debt.total - (debt.amount_paid || 0));
  };

  // Filter debts based on search term and status filter
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          debt.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || getStatus(debt) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mobile view
  if (isMobile) {
    return (
      <div className="p-4">
        {/* Header with search and filters */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debts Overview</h1>
          
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 mb-3">
            <FiSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["All", "Paid", "Partial", "Unpaid"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  statusFilter === status 
                    ? status === "All" 
                      ? "bg-blue-100 text-blue-800" 
                      : statusClasses[status]
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Debts</p>
            <p className="text-2xl font-bold text-gray-900">{debts.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(debts.reduce((sum, debt) => sum + getBalance(debt), 0))}
            </p>
          </div>
        </div>

        {/* Debt cards */}
        <div className="space-y-4">
          {filteredDebts.length ? (
            filteredDebts.map((debt) => {
              const balance = getBalance(debt);
              const status = getStatus(debt);

              return (
                <div
                  key={debt.id}
                  className="bg-white rounded-xl shadow-sm p-4 relative border border-gray-100 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {debt.customer_name || "Unknown Customer"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{debt.phone || "No phone"}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.Unpaid} flex items-center`}
                      >
                        <span className="mr-1">{statusIcons[status]}</span>
                        {status}
                      </span>
                      {showActions && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(debt.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 ml-2"
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                      <p className="font-semibold text-gray-900 text-sm">{formatCurrency(debt.total)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-medium">Balance</p>
                      <p className="font-semibold text-gray-900 text-sm">{formatCurrency(balance)}</p>
                    </div>
                  </div>

                  {showActions && openMenuId === debt.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={closeMenu}
                        aria-hidden="true"
                      />
                      <div className="absolute right-4 top-16 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 overflow-hidden">
                        <button
                          onClick={() => {
                            navigate(`/customers/${debt.id}`);
                            closeMenu();
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FaHistory className="mr-3 text-gray-500" />
                          View Debt History
                        </button>
                        {(user?.role === 'owner') && (
                          <button
                            onClick={() => {
                              console.log("Delete", debt);
                              closeMenu();
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            <FaTrash className="mr-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="text-gray-400 text-xl" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg mb-2">No debts found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "All" 
                  ? "Try adjusting your search or filter" 
                  : "Add a new debt to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="p-6 ml-6 mt-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debts Overview</h1>
          <p className="text-gray-600 mt-1">Manage and track customer debts</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Debts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{debts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(debts.reduce((sum, debt) => sum + debt.total, 0))}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(debts.reduce((sum, debt) => sum + getBalance(debt), 0))}
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
          <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2 md:mr-4">
            <FiSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Filter by:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {["All", "Paid", "Partial", "Unpaid"].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {showActions && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDebts.length ? (
                filteredDebts.map((debt) => {
                  const balance = getBalance(debt);
                  const status = getStatus(debt);

                  return (
                    <tr key={debt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                            {debt.customer_name ? debt.customer_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {debt.customer_name || "Unknown Customer"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {debt.phone || "No phone"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(debt.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.Unpaid}`}
                        >
                          {statusIcons[status]} {status}
                        </span>
                      </td>
                      {showActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(debt.id);
                            }}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FiMoreVertical size={18} />
                          </button>

                          {openMenuId === debt.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={closeMenu}
                                aria-hidden="true"
                              />
                              <div className="absolute right-6 top-10 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 overflow-hidden">
                                <button
                                  onClick={() => {
                                    navigate(`/customers/${debt.id}`);
                                    closeMenu();
                                  }}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <FaHistory className="mr-3 text-gray-500" />
                                  View Debt History
                                </button>
                                {(user?.role === 'owner') && (
                                  <button
                                    onClick={() => {
                                      console.log("Delete", debt);
                                      closeMenu();
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                  >
                                    <FaTrash className="mr-3" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={showActions ? 6 : 5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiSearch className="text-gray-400 text-xl" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-lg mb-2">No debts found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm || statusFilter !== "All" 
                        ? "Try adjusting your search or filter criteria" 
                        : "Get started by adding a new debt to your records"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DebtTable;