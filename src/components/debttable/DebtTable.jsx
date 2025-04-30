import React from "react";
import "./debttable.css";

function DebtTable({ debts=[]}) {
  console.log("debts in debts table", debts);
  return (
    <div className="debt-table-container">
      <div className="table-responsive">
        <table className="debt-table">
          <thead>
            <tr className="table-header">
              <th>Creditor</th>
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
            {debts && debts.length > 0 ? (
              debts.map((debt,index) => (
                <tr
                  key={debt.id}
                  className={index % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="customer-name">{debt.customerName}</td>
                  <td className="phone-number">{debt.phoneNumber}</td>
                  <td className="debt-name">{debt.debtName}</td>
                  <td className="items-list">
                    <ul>
                      {debt.items?.map((item) => (
                        <li key={debt.id}>
                          {item.name} ({item.quantity} * Ksh{item.price})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="amount-paid">Ksh{debt.amountPaid}</td>
                  <td className={`status ${debt.status?.toLowerCase()}`}>
                    {debt.status}
                  </td>
                  <td className="due-date">
                    {debt.dueDate
                      ? new Date(debt.dueDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="created-at">
                    {debt.createdAt
                      ? new Date(debt.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="total-amount">Ksh{debt.total}</td>
                </tr>
              ))
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
