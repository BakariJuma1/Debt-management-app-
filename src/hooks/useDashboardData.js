import { useEffect, useState } from "react";

export function useDashboardData() {
  const [debts, setDebts] = useState([]);
  const API_URL = "https://debt-backend-lj7p.onrender.com/api/debts";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setDebts)
      .catch((err) => console.error("Error loading debts:", err));
  }, []);

  const totalDebts = debts.reduce((sum, d) => sum + d.total, 0);
  const paidDebts = debts.filter((d) => d.status === "paid");
  const overdueDebts = debts.filter((d) => d.status === "overdue");
  const totalUnpaid = totalDebts - paidDebts.reduce((sum, d) => sum + d.total, 0);

  const recentActivity = [...debts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((d) => ({
      customer: d.customerName,
      action: d.status === "paid" ? "Paid" : "Added",
      date: new Date(d.createdAt).toLocaleDateString(),
    }));

  return {
    debts,
    totalDebts,
    paidDebts,
    overdueDebts,
    totalUnpaid,
    recentActivity,
  };
}
