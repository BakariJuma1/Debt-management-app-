// Example: AddDebt.jsx with syntax cleaned and fixed
import React, { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import "../adddebt/adddebt.css";
import "../layout/Layout";
import Layout from "../layout/Layout";

function AddDebt() {
  const initialFormData = {
    customerName: "",
    phone: "",
    idNumber: "",
    debtName: "",
    items: [
      {
        name: "",
        quantity: "",
        price: "",
        category: "",
      },
    ],
    amountPaid: "",
    status: "",
    dueDate: "",
    receipt: "",
    createdAt: new Date().toISOString(),
    total: "",
    assignedTo: "",
  };

  const categories = [
    "construction",
    "hardware",
    "agriculture",
    "security",
    "groceries",
    "tools",
  ];

  const statusOptions = ["unpaid", "partially", "paid"];

  const [debt, setDebt] = useState(initialFormData);

  function handleChange(e) {
    const { name, value } = e.target;
    setDebt({ ...debt, [name]: value });
  }

  function handleItemChange(index, e) {
    const { name, value } = e.target;
    const updatedItems = [...debt.items];
    updatedItems[index][name] = value;
    setDebt({ ...debt, items: updatedItems });
  }

  function addItem() {
    setDebt({
      ...debt,
      items: [
        ...debt.items,
        { name: "", quantity: "", price: "", category: "" },
      ],
    });
  }

  function calculateTotal() {
    return debt.items.reduce((acc, item) => {
      const itemTotal =
        parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
      return acc + itemTotal;
    }, 0);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const total = calculateTotal();
    const newDebt = {
      ...debt,
      total,
    };

    fetch("https://debt-backend-lj7p.onrender.com/api/debts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDebt),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save debt");
        return res.json();
      })
      .then((data) => {
        console.log("Debt saved:", data);
        alert("Debt submitted successfully!");
        setDebt(initialFormData); // reset form
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong. Please try again.");
      });
  }

  return (
    <Layout>
      <div>
        <div className="container">
          <form onSubmit={handleSubmit}>
            <h3>Customer Information</h3>
            <input
              name="customerName"
              value={debt.customerName}
              onChange={handleChange}
              placeholder="Customer Name"
            />
            <input
              name="phone"
              value={debt.phone}
              onChange={handleChange}
              placeholder="Phone"
            />

            <h3>Items</h3>
            {debt.items.map((item, index) => (
              <div key={index}>
                <input
                  name="name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Item Name"
                />
                <input
                  name="quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Quantity"
                />
                <input
                  name="price"
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Price"
                />
                <select
                  name="category"
                  value={item.category}
                  onChange={(e) => handleItemChange(index, e)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button type="button" onClick={addItem}>
              + Add Item
            </button>

            <h3>Payment Details</h3>
            <input
              name="amountPaid"
              type="number"
              value={debt.amountPaid}
              onChange={handleChange}
              placeholder="Amount Paid"
            />

            <select name="status" value={debt.status} onChange={handleChange}>
              <option value="">Select Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              name="dueDate"
              type="date"
              value={debt.dueDate}
              onChange={handleChange}
            />

            <input
              name="receipt"
              value={debt.receipt}
              onChange={handleChange}
              placeholder="Receipt / Note"
            />

            <p>
              <strong>Total:</strong> Ksh {calculateTotal()}
            </p>

            <button type="submit">Submit Debt</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AddDebt;
