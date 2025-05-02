import React from "react";
import "./debttable.css";

function DebtTable({ debts = [] }) {
  // Safe currency formatting
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

  // Safe date formatting
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="debt-table-container">
      <div className="table-responsive">
        <table className="debt-table">
          <thead>
            <tr className="table-header">
              <th>Customer</th>
              <th>Phone</th>
              <th>Debt Name</th>
              <th>Items</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Created</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(debts) && debts.length > 0 ? (
              debts.map((debt) => {
                if (!debt || typeof debt !== "object") return null;

                return (
                  <tr
                    key={
                      debt.id ||
                      `debt-${Math.random().toString(36).substr(2, 9)}`
                    }
                    className={debt.status === "paid" ? "paid-row" : ""}
                  >
                    <td className="customer-name">
                      {debt.customerName || "N/A"}
                    </td>
                    <td className="phone-number">{debt.phone || "N/A"}</td>
                    <td className="debt-name">
                      {debt.debtName || "Unnamed Debt"}
                      {debt.receipt && (
                        <div className="receipt-note">{debt.receipt}</div>
                      )}
                    </td>
                    <td className="items-list">
                      <ul>
                        {Array.isArray(debt.items) ? (
                          debt.items.map((item, i) => (
                            <li key={`${debt.id}-item-${i}`}>
                              {item?.name || "Unnamed Item"} (
                              {item?.quantity || 0} ×{" "}
                              {formatCurrency(item?.price)})
                            </li>
                          ))
                        ) : (
                          <li>No items listed</li>
                        )}
                      </ul>
                    </td>
                    <td className="amount-paid">
                      {formatCurrency(debt.amountPaid)}
                    </td>
                    <td
                      className={`status ${String(debt.status || "")
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      <span className="status-badge">
                        {debt.status || "Unknown"}
                      </span>
                    </td>
                    <td className="due-date">{formatDate(debt.dueDate)}</td>
                    <td className="created-at">{formatDate(debt.createdAt)}</td>
                    <td className="total-amount">
                      {formatCurrency(debt.total)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-debts-message">
                  No debts found. Add a new debt to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DebtTable;
