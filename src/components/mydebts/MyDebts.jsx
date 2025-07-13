import React from "react";
import Sidebar from "../sidebar/Sidebar";
import DebtTable from "../debttable/DebtTable";
import DebtList from "../DebtList";
import Layout from "../layout/Layout";

function MyDebts() {
  return (
    <Layout>
      <DebtList />
    </Layout>
  );
}

export default MyDebts;
