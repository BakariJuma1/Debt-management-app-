import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMoneyBillAlt,
  FaFilePdf,
  FaEnvelope,
  FaListUl,
  FaHistory,
  FaTrash,
} from "react-icons/fa";
import Layout from "../layout/Layout";
import "./customerdetail.css";

function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [itemHistory, setItemHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "",
    receivedBy: "",
  });
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const res = await fetch("https://debt-backend-lj7p.onrender.com/api/debts");
        const allCustomers = await res.json();
        const customerData = allCustomers.find((c) => c.id === customerId);
        if (!customerData) throw new Error("Customer not found");

        setCustomer(customerData);
        setEditedItems(customerData.items || []);
        setPayments(customerData.payments || []);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    }

    fetchCustomerData();
  }, [customerId]);

  const formatCurrency = (amount) => `Ksh${Number(amount || 0).toLocaleString()}`;

  const balance = customer ? customer.total - (customer.amountPaid || 0) : 0;

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...editedItems];
    const prev = updated[index][name];
    updated[index][name] = value;
    setEditedItems(updated);
    if (prev !== value) {
      addItemHistory(`Edited "${name}" from "${prev}" to "${value}"`);
    }
  };

  const handleRemoveItem = (index) => {
    const removed = editedItems[index];
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
    addItemHistory(`Removed "${removed.name}" × ${removed.quantity}`);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      alert("Please fill in all item fields");
      return;
    }

    const updatedItems = [...editedItems, newItem];
    setEditedItems(updatedItems);
    setNewItem({ name: "", quantity: "", price: "", category: "" });
    addItemHistory(`Added new item "${newItem.name}" × ${newItem.quantity}`);
  };

  const addItemHistory = (msg) => {
    const time = new Date().toLocaleString();
    setItemHistory((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const handleInputChange = (e) => {
    setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
  };

  const handleAddPayment = () => {
    const today = new Date().toISOString().split("T")[0];
    const payment = { ...newPayment, date: today };

    setPayments([payment, ...payments]);
    setNewPayment({ amount: "", method: "", receivedBy: "" });
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`https://your-backend-url/api/debts/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: editedItems }),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      const updatedCustomer = await res.json();
      setCustomer(updatedCustomer);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving changes. Please try again.");
    }
  };

  const generateSummaryMessage = () => {
    const itemList = editedItems
      .map(
        (item) =>
          `- ${item.name} × ${item.quantity} @ Ksh${item.price} (${item.category || "N/A"})`
      )
      .join("\n");

    const paymentList = payments
      .map(
        (p) =>
          `- ${p.date}: Ksh${p.amount} via ${p.method}, received by ${p.receivedBy}`
      )
      .join("\n");

    return encodeURIComponent(`Hello, I hope you are well. Here is the summary of your debt:
      *Debt Summary for ${customer.customerName}*\n
 Phone: ${customer.phone}
 Total: Ksh${customer.total}
 Balance: Ksh${balance}
 Due Date: ${customer.dueDate || "N/A"}

 *Items Taken:*
${itemList || "No items listed."}

 *Payments Made:*
${paymentList || "No payments yet."}

 Summary generated on ${new Date().toLocaleDateString()}`);
  };

  if (!customer) return <p>Loading customer info...</p>;

  return (
    <Layout>
      <div className="customer-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back
        </button>

        <h2>{customer.customerName} - {customer.phone}</h2>
        <p><strong>Total:</strong> {formatCurrency(customer.total)} | <strong>Balance:</strong> {formatCurrency(balance)}</p>

        {/* Items Section */}
        <section className="items-section">
          <h3><FaListUl /> Items Taken (Editable)</h3>
          {editedItems.map((item, index) => (
            <div key={index} className="editable-item">
              <input type="text" name="name" value={item.name} onChange={(e) => handleItemChange(index, e)} placeholder="Item Name" />
              <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} placeholder="Qty" />
              <input type="number" name="price" value={item.price} onChange={(e) => handleItemChange(index, e)} placeholder="Price" />
              <button onClick={() => handleRemoveItem(index)}><FaTrash /></button>
            </div>
          ))}
          <button onClick={handleSaveChanges} className="save-btn">Save Changes</button>
        </section>

        {/* Add New Item */}
        <section className="add-item-form">
          <h4>Add New Item</h4>
          <input name="name" placeholder="Item Name" value={newItem.name} onChange={handleNewItemChange} />
          <input name="quantity" type="number" placeholder="Quantity" value={newItem.quantity} onChange={handleNewItemChange} />
          <input name="price" type="number" placeholder="Price" value={newItem.price} onChange={handleNewItemChange} />
          <input name="category" placeholder="Category" value={newItem.category} onChange={handleNewItemChange} />
          <button onClick={handleAddItem}>+ Add Item</button>
        </section>

        {/* Payment Section */}
        <section className="payment-form">
          <h3><FaMoneyBillAlt /> Add Payment</h3>
          <input name="amount" placeholder="Amount" value={newPayment.amount} onChange={handleInputChange} />
          <select name="method" value={newPayment.method} onChange={handleInputChange}>
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
          <input name="receivedBy" placeholder="Received By" value={newPayment.receivedBy} onChange={handleInputChange} />
          <button onClick={handleAddPayment}>Add Payment</button>
        </section>

        {/* Payment History */}
        <section className="payment-history">
          <h3><FaHistory /> Payment History</h3>
          <ul>
            {payments.map((p, i) => (
              <li key={i}>
                {p.date}: {formatCurrency(p.amount)} - {p.method} - Received by {p.receivedBy}
              </li>
            ))}
          </ul>
        </section>

        {/* Item History */}
        <section className="item-history">
          <h3><FaHistory /> Change Log</h3>
          <ul>
            {itemHistory.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <section className="actions">
          <button onClick={() => console.log("Export PDF")}>
            <FaFilePdf /> Export PDF
          </button>
          <button
            onClick={() => {
              const summary = generateSummaryMessage();
              const phone = customer.phone.replace(/^0/, "254");
              window.open(`https://wa.me/${phone}?text=${summary}`, "_blank");
            }}
          >
            <FaEnvelope /> Send Summary o
          </button>
        </section>
      </div>
    </Layout>
  );
}

export default CustomerDetailPage;
