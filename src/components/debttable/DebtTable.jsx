import React, { useState, useEffect } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { FaHistory, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";

const statusClasses = {
  Paid: "bg-green-100 text-green-800",
  Partial: "bg-yellow-100 text-yellow-800",
  Unpaid: "bg-red-100 text-red-800"
};

function DebtTable({ debts = [] }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initialize on mount
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

  const getStatus = (balance, amountPaid) => {
    return balance === 0 ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="px-4 py-2 space-y-3">
        {debts.length ? (
          debts.map((debt) => {
            const amountPaid = debt.amountPaid || 0;
            const balance = debt.total - amountPaid;
            const status = getStatus(balance, amountPaid);

            return (
              <div 
                key={debt.id} 
                className="bg-white rounded-lg shadow p-4 relative border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{debt.customerName}</h3>
                    <p className="text-sm text-gray-600">{debt.phone}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(debt.id);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(debt.total)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Balance</p>
                    <p className="font-medium">{formatCurrency(balance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                      {status}
                    </span>
                  </div>
                </div>

                {openMenuId === debt.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={closeMenu}
                      aria-hidden="true"
                    />
                    <div className="absolute right-4 top-10 z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-40">
                      <button
                        onClick={() => {
                          navigate(`/customers/${debt.id}`);
                          closeMenu();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaHistory className="mr-2" />
                        View History
                      </button>
                      <button
                        onClick={() => {
                          console.log("Delete", debt);
                          closeMenu();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No debts found. Add a new debt to get started.</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <Layout>
      <div className="px-4 py-2 overflow-x-auto ">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {debts.length ? (
              debts.map((debt) => {
                const amountPaid = debt.amountPaid || 0;
                const balance = debt.total - amountPaid;
                const status = getStatus(balance, amountPaid);

                return (
                  <tr key={debt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {debt.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {debt.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(debt.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(debt.id);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
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
                          <div className="absolute right-6 top-10 z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-40">
                            <button
                              onClick={() => {
                                navigate(`/customers/${debt.id}`);
                                closeMenu();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaHistory className="mr-2" />
                              View History
                            </button>
                            <button
                              onClick={() => {
                                console.log("Delete", debt);
                                closeMenu();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <FaTrash className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No debts found. Add a new debt to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default DebtTable;