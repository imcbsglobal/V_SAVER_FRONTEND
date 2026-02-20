import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AddCategory.scss";

import { API_BASE_URL } from "../services/config";

function AddCategory({ onLogout, userData }) {
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("name", categoryName);
      if (categoryDescription) formData.append("description", categoryDescription);

      const response = await fetch(`${API_BASE_URL}/categories/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const created = await response.json();
        setMessage({ type: "success", text: "Category added successfully!" });
        setCategoryName("");
        setCategoryDescription("");
        fetchCategories();

        // Navigate immediately to Add Product page
        navigate("/add-product", { state: { categoryName: created.name } });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.detail || errorData.error || "Failed to add category",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMessage({ type: "error", text: "Authentication token not found. Please login again." });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Category deleted successfully!" });
        await fetchCategories();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({
          type: "error",
          text: errorData.detail || errorData.error || "Failed to delete category",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-page">
      <div className="dashboard-container">
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onLogout={onLogout}
          userName={userData?.username || userData?.email || "User"}
        />

        <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <div className="category-container">
            <div className="page-header">
              <h1 className="page-title">Category Management</h1>
              <p className="page-subtitle">Add and manage your offer categories</p>
            </div>

            <div className="category-grid">
              <div className="category-card">
                <h2 className="card-title">
                  <span className="icon">📝</span>
                  Add New Category
                </h2>

                {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

                <form onSubmit={handleSubmit} className="category-form">
                  <div className="form-group">
                    <label htmlFor="categoryName" className="form-label">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      className="form-input"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="categoryDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="categoryDescription"
                      className="form-input"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      placeholder="Enter category description (optional)"
                      rows="4"
                      disabled={loading}
                    />
                  </div>

                  <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
                    {loading ? (
                      <span className="loading-content">
                        <span className="spinner"></span>
                        Adding...
                      </span>
                    ) : (
                      "Add Category"
                    )}
                  </button>
                </form>
              </div>

              <div className="category-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="icon">📋</span>
                    Existing Categories
                  </h2>
                  <span className="category-count">
                    {categories.length} {categories.length === 1 ? "category" : "categories"}
                  </span>
                </div>

                <div className="categories-list">
                  {categories.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <p className="empty-title">No categories yet</p>
                      <p className="empty-subtitle">Add your first category to get started</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="category-item">
                        <div className="category-info">
                          <div className="category-placeholder">{category.name.charAt(0).toUpperCase()}</div>
                          <div className="category-details">
                            <p className="category-name">{category.name}</p>
                            
                          </div>
                        </div>
                        <div className="category-actions">
                          <button onClick={() => handleDelete(category.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddCategory;