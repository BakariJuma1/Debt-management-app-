import React from "react";
import Sidebar from "../sidebar/Sidebar";
import DebtTable from "../debttable/DebtTable";
import DebtList from "../DebtList";

function MyDebts() {
  return (
    <div>
      <Sidebar />

      <DebtList />
    </div>
  );
}

export default MyDebts;
