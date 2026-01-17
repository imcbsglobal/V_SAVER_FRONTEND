import React, { useState, useEffect } from "react";

const EditUser = ({ user, onBack, onUserUpdated }) => {
  const [formData, setFormData] = useState({ ...user });

  const token = localStorage.getItem("access_token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`http://127.0.0.1:8000/api/admins/${user.id}/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    onUserUpdated();
    onBack();
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack}>⬅ Back</button>
      <h2>Edit User</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid">
          {[
            "customer_name",
            "shop_name",
            "username",
            "email",
            "phone_number",
            "amount",
            "location",
            "no_days",
            "validity_start",
            "validity_end"
          ].map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                type={key.includes("date") ? "date" : "text"}
                name={key}
                value={formData[key] || ""}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div>
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Disable">Disable</option>
            </select>
          </div>
        </div>

        <button type="submit">Update User</button>
      </form>
    </div>
  );
};

export default EditUser;
 