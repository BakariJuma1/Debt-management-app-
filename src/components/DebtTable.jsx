import React from "react";

function DebtTable({ debt }) {
  return (
    <div>
      <div className="table container">
        <table className="debtTable">
          <thead>
            <tr>
              <th>Creditor</th>
              <th>Phone Number</th>
              <th>Items</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>DueDate</th>
              <th>Created at</th>
              <th>total</th>
            </tr>
          </thead>
          <tbody>
            <tr>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DebtTable;
