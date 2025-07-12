// DebtTable.jsx
import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { FaMoneyBillAlt, FaHistory, FaTrash } from "react-icons/fa";
import "./debttable.css";

function DebtTable({ debts = [] }) {
  const [openMenuId, setOpenMenuId] = useState(null);

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
            debts.map((debt) => (
              <tr key={debt.id}>
                <td>{debt.customerName}</td>
                <td>{debt.phone}</td>
                <td>{formatCurrency(debt.total)}</td>
                <td>{formatCurrency(debt.balance)}</td>
                <td>
                  <span
                    className={`status-badge ${
                      debt.balance === 0
                        ? "paid"
                        : debt.balance < debt.total
                        ? "partial"
                        : "unpaid"
                    }`}
                  >
                    {debt.balance === 0
                      ? "Paid"
                      : debt.balance < debt.total
                      ? "Partial"
                      : "Unpaid"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button onClick={() => toggleMenu(debt.id)} className="dropdown-toggle">
                    <FiMoreVertical size={20} />
                  </button>
                  {openMenuId === debt.id && (
                    <ul className="dropdown-menu">
                      <li onClick={() => console.log("View History", debt)}>
                        <FaHistory /> View History
                      </li>
                      <li onClick={() => console.log("Delete", debt)}>
                        <FaTrash /> Delete
                      </li>
                    </ul>
                  )}
                </td>
              </tr>
            ))
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
