import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { FaHistory, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./debttable.css";

function DebtTable({ debts = [] }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

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
      return `Ksh${amount || 0}`;
    }
  };

  return (
    <div className="debt-table-container">
      <table className="debt-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Total</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(debts) && debts.length > 0 ? (
            debts.map((debt) => {
              const amountPaid = debt.amountPaid || 0;
              const balance = debt.total - amountPaid;

              const status =
                balance === 0
                  ? "Paid"
                  : amountPaid > 0
                  ? "Partial"
                  : "Unpaid";

              const statusClass =
                balance === 0
                  ? "paid"
                  : amountPaid > 0
                  ? "partial"
                  : "unpaid";

              return (
                <tr key={debt.id}>
                  <td>{debt.customerName}</td>
                  <td>{debt.phone}</td>
                  <td>{formatCurrency(debt.total)}</td>
                  <td>{formatCurrency(balance)}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => toggleMenu(debt.id)}
                      className="dropdown-toggle"
                    >
                      <FiMoreVertical size={20} />
                    </button>
                    {openMenuId === debt.id && (
                      <ul className="dropdown-menu">
                        <li onClick={() => navigate(`/customers/${debt.id}`)}>
                          <FaHistory /> View History
                        </li>
                        <li onClick={() => console.log("Delete", debt)}>
                          <FaTrash /> Delete
                        </li>
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="no-debts-message">
                No debts found. Add a new debt to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DebtTable;
