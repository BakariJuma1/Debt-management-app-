import React, { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { FaHistory, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./debttable.css";
import Layout from "../layout/Layout";

function DebtTable({ debts = [] }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const renderStatus = (balance, amountPaid) => {
    const status =
      balance === 0 ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";

    const statusClass =
      balance === 0 ? "paid" : amountPaid > 0 ? "partial" : "unpaid";

    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (isMobile) {
    return (
      <div className="debt-cards-container">
        {debts.length ? (
          debts.map((debt) => {
            const amountPaid = debt.amountPaid || 0;
            const balance = debt.total - amountPaid;

            return (
              <div className="debt-card" key={debt.id}>
                <div className="debt-card-header">
                  <h3>{debt.customerName}</h3>
                  <button
                    onClick={() => toggleMenu(debt.id)}
                    className="dropdown-toggle"
                  >
                    <FiMoreVertical size={20} />
                  </button>
                </div>
                <p>
                  <strong>Phone:</strong> {debt.phone}
                </p>
                <p>
                  <strong>Total:</strong> {formatCurrency(debt.total)}
                </p>
                <p>
                  <strong>Balance:</strong> {formatCurrency(balance)}
                </p>
                <p>
                  <strong>Status:</strong> {renderStatus(balance, amountPaid)}
                </p>

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
              </div>
            );
          })
        ) : (
          <p className="no-debts-message">
            No debts found. Add a new debt to get started.
          </p>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <Layout>
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
            {debts.length ? (
              debts.map((debt) => {
                const amountPaid = debt.amountPaid || 0;
                const balance = debt.total - amountPaid;

                return (
                  <tr key={debt.id}>
                    <td>{debt.customerName}</td>
                    <td>{debt.phone}</td>
                    <td>{formatCurrency(debt.total)}</td>
                    <td>{formatCurrency(balance)}</td>
                    <td>{renderStatus(balance, amountPaid)}</td>
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
    </Layout>
  );
}

export default DebtTable;
