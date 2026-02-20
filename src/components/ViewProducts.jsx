import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./ViewProducts.scss";

import { API_BASE_URL } from "../services/config";

function ViewProducts({ onLogout, userData }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategory] = useState("");
  const [brandFilter, setBrand] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleToggleSidebar = () => setIsSidebarOpen((v) => !v);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to load products (${res.status}).`);
        console.error("Products response:", text);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Request failed. Check backend/CORS/server logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    navigate("/add-product", { 
      state: { 
        editMode: true,
        productData: product
      } 
    });
  };

  const deleteProduct = async (productId) => {
    const ok = window.confirm("Delete this product permanently?");
    if (!ok) return;

    setLoading(true);
    setError("");
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/products/${productId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setMessage({ type: "success", text: "Product deleted successfully." });
      } else {
        const text = await res.text();
        console.error("Delete response:", text);
        setError(`Failed to delete product (${res.status}).`);
      }
    } catch (e) {
      console.error(e);
      setError("Delete request failed. Check backend/CORS/server logs.");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on all criteria
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    // Brand filter
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    
    // Date filters
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (startDate && product.created_at) {
      const productDate = new Date(product.created_at);
      const filterStartDate = new Date(startDate);
      matchesStartDate = productDate >= filterStartDate;
    }
    
    if (endDate && product.created_at) {
      const productDate = new Date(product.created_at);
      const filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      matchesEndDate = productDate <= filterEndDate;
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesStartDate && matchesEndDate;
  });

  // Get unique categories and brands for dropdowns
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategory("");
    setBrand("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = searchQuery || categoryFilter || brandFilter || startDate || endDate;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="view-products-page">
      <div className="dashboard-container">
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onLogout={onLogout}
          userName={userData?.username || userData?.email || "User"}
        />

        <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <div className="products-container">
            

           
              {/* Page Header */}
                <div className="page-header">
                  <div className="header-content">
                    <h1 className="page-title">Product Inventory Report</h1>
                    <p className="page-subtitle">View and manage product inventory details</p>
                    <div className="title-underline"></div>
                  </div>
                  
                  <button className="refresh-btn" onClick={fetchProducts} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>

            {/* Alerts */}
            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {message.text}
              </div>
            )}

            {/* FILTER BAR */}
            <div className="filter-bar">
              {/* Search */}
              <div className="filter-item search-item">
                <div className="search-wrapper">
                  <svg className="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-btn" onClick={() => setSearchQuery("")}>×</button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="filter-item">
                <label>Filter by Category</label>
                <select value={categoryFilter} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {uniqueCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="filter-item">
                <label>Filter by Brand</label>
                <select value={brandFilter} onChange={(e) => setBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {uniqueBrands.map((brand, idx) => (
                    <option key={idx} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* From Date */}
              <div className="filter-item">
                <label>From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* To Date */}
              <div className="filter-item">
                <label>To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="filter-summary">
                <span className="filter-count">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
                <button className="clear-all" onClick={clearAllFilters}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Clear All
                </button>
              </div>
            )}

            {/* Products Display */}
            {loading && products.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <h3>{hasActiveFilters ? "No products match your filters" : "No products found"}</h3>
                <p>{hasActiveFilters ? "Try adjusting your search criteria" : "Start by adding your first product"}</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="product-card">
                    <div className="product-image">
                      {p.image ? (
                        <img src={p.image} alt={p.product_name} />
                      ) : (
                        <div className="no-image">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{p.product_name}</h3>
                      <div className="product-id">#{p.id?.substring(0, 8) || 'N/A'}</div>

                      <div className="product-details">
                        <div className="detail-row">
                          <span className="detail-label">Brand:</span>
                          <span className="detail-value">{p.brand || 'N/A'}</span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{p.category || 'N/A'}</span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="detail-label">Original Price:</span>
                          <span className="detail-value">₹{p.original_price}</span>
                        </div>

                        <div className="detail-row">
                          <span className="detail-label">Offer Price:</span>
                          <span className="detail-value offer-price">₹{p.offer_price}</span>
                        </div>

                        <div className="detail-row">
                          <span className="detail-label">Template:</span>
                          <span className="detail-value">{p.template_type || 'N/A'}</span>
                        </div>

                        <div className="detail-row">
                          <span className="detail-label">Created:</span>
                          <span className="detail-value date-value">{formatDateTime(p.created_at)}</span>
                        </div>

                        <div className="detail-row">
                          <span className="detail-label">Status:</span>
                          <span className={`detail-value status ${p.is_active ? 'active' : 'inactive'}`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="product-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditProduct(p)}
                          disabled={loading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        
                        <button
                          className="delete-btn"
                          onClick={() => deleteProduct(p.id)}
                          disabled={loading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewProducts;