import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMoneyBillAlt,
  FaFilePdf,
  FaEnvelope,
  FaListUl,
  FaHistory,
} from "react-icons/fa";
import "./customerdetail.css";
import Sidebar from "../sidebar/Sidebar";

function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "",
    receivedBy: "",
  });

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const res = await fetch(
          "https://debt-backend-lj7p.onrender.com/api/debts"
        )
        const allCustomers = await res.json();

        // Find customer by ID (IDs are strings)
        const customerData = allCustomers.find(
          (c) => c.id === customerId
        );

        if (!customerData) throw new Error("Customer not found");

        setCustomer(customerData);
        setPayments(customerData.payments || []);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    }

    fetchCustomerData();
  }, [customerId]);

  const handleInputChange = (e) => {
    setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
  };

  const handleAddPayment = () => {
    const today = new Date().toISOString().split("T")[0];
    const paymentToAdd = {
      ...newPayment,
      date: today,
    };

    setPayments([paymentToAdd, ...payments]);
    setNewPayment({ amount: "", method: "", receivedBy: "" });
  };

  const formatCurrency = (amount) =>
    `Ksh${Number(amount || 0).toLocaleString()}`;

  if (!customer) return <p>Loading customer info...</p>;

  const balance = customer.total - (customer.amountPaid || 0);

  return (
    <>
    <Sidebar></Sidebar>
    <div className="customer-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Table
      </button>

      <h2>
        {customer.customerName} - {customer.phone}
      </h2>
      <p>
        <strong>Total:</strong> {formatCurrency(customer.total)} |{" "}
        <strong>Balance:</strong> {formatCurrency(balance)}
      </p>

      <section className="items-section">
        <h3>
          <FaListUl /> Items Taken:
        </h3>
        <ul>
          {customer.items?.map((item, index) => (
            <li key={index}>
              {item.name} × {item.quantity} @ {formatCurrency(item.price)}
            </li>
          ))}
        </ul>
      </section>

      <section className="payment-form">
        <h3>
          <FaMoneyBillAlt /> Add Payment
        </h3>
        <input
          name="amount"
          placeholder="Amount"
          value={newPayment.amount}
          onChange={handleInputChange}
        />
        <input
          name="method"
          placeholder="Method (Cash, M-Pesa, etc)"
          value={newPayment.method}
          onChange={handleInputChange}
        />
        <input
          name="receivedBy"
          placeholder="Received By"
          value={newPayment.receivedBy}
          onChange={handleInputChange}
        />
        <button onClick={handleAddPayment}>Add Payment</button>
      </section>

      <section className="payment-history">
        <h3>
          <FaHistory /> Payment History
        </h3>
        <ul>
          {payments.map((p, index) => (
            <li key={index}>
              {p.date}: {formatCurrency(p.amount)} - {p.method} - Received by{" "}
              {p.receivedBy}
            </li>
          ))}
        </ul>
      </section>

      <section className="actions">
        <button onClick={() => console.log("Export PDF")}>
          <FaFilePdf /> Export PDF
        </button>
        <button onClick={() => console.log("Send Summary")}>
          <FaEnvelope /> Send Summary
        </button>
      </section>
    </div>
    </>
  );
}

export default CustomerDetailPage;
