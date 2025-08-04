import React from "react";
import Sidebar from "../sidebar/Sidebar";
import DebtTable from "../debttable/DebtTable";
import DebtList from "../DebtList";
import Layout from "../layout/Layout";
import Search from "../search/Search";

function MyDebts() {
  return (
    <Layout>
      <DebtList />
    </Layout>
  );
}

export default MyDebts;
