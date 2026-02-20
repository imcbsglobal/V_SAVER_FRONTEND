import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AddProduct.scss";

import { API_BASE_URL } from "../services/config";

function AddProduct({ onLogout, userData }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if we're in edit mode
  const editMode = location.state?.editMode || false;
  const productData = location.state?.productData || null;

  const [productId, setProductId] = useState(productData?.id || null);
  const [productName, setProductName] = useState(productData?.product_name || "");
  const [brand, setBrand] = useState(productData?.brand || "");
  const [category, setCategory] = useState(productData?.category || location.state?.categoryName || "");
  const [categories, setCategories] = useState([]);
  const [originalPrice, setOriginalPrice] = useState(productData?.original_price || "");
  const [offerPrice, setOfferPrice] = useState(productData?.offer_price || "");
  const [validUntil, setValidUntil] = useState("");
  const [templateType, setTemplateType] = useState(productData?.template_type || "template1");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(productData?.image || null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Price validation states
  const [priceError, setPriceError] = useState("");
  const [showPriceModal, setShowPriceModal] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Set the category from navigation state after categories are loaded
  useEffect(() => {
    if (!editMode && location.state?.categoryName && categories.length > 0) {
      setCategory(location.state.categoryName);
    }
  }, [location.state, categories, editMode]);

  // Real-time price validation
  useEffect(() => {
    validatePrices();
  }, [originalPrice, offerPrice]);

  const validatePrices = () => {
    const original = parseFloat(originalPrice);
    const offer = parseFloat(offerPrice);

    if (originalPrice && offerPrice) {
      if (offer >= original) {
        setPriceError("Offer price must be less than original price");
        return false;
      }
    }
    setPriceError("");
    return true;
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        // If there's a newly added category from navigation state, prioritize it
        if (!editMode && location.state?.categoryName) {
          const newCategory = location.state.categoryName;
          
          // Sort categories to put the new category first
          const sortedCategories = data.sort((a, b) => {
            if (a.name === newCategory) return -1;
            if (b.name === newCategory) return 1;
            return a.name.localeCompare(b.name);
          });
          
          setCategories(sortedCategories);
        } else {
          // Sort alphabetically if no new category
          const sortedCategories = data.sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sortedCategories);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({ type: "error", text: "Failed to load categories" });
    }
  };

  const handleToggleSidebar = () => setIsSidebarOpen((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check price validation before submitting
    const original = parseFloat(originalPrice);
    const offer = parseFloat(offerPrice);
    
    if (offer >= original) {
      setShowPriceModal(true);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMessage({ type: "error", text: "No token found. Please login again." });
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("product_name", productName);
      form.append("brand", brand);
      form.append("original_price", originalPrice);
      form.append("offer_price", offerPrice);
      form.append("template_type", templateType);
      
      // Only append image if a new one is selected
      if (image) form.append("image", image);

      // For edit mode, use PUT request
      if (editMode && productId) {
        const res = await fetch(`${API_BASE_URL}/products/${productId}/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (res.ok) {
          setMessage({ type: "success", text: "Product updated successfully!" });
          
          // Navigate to view products page after successful update
          setTimeout(() => {
            navigate("/view-products");
          }, 1000);
        } else {
          const data = await res.json().catch(() => ({}));
          setMessage({ type: "error", text: data?.detail || data?.error || "Failed to update product" });
        }
      } else {
        // For add mode, include category and valid_until
        form.append("category", category);
        if (validUntil) form.append("valid_until", validUntil);

        const res = await fetch(`${API_BASE_URL}/products/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (res.ok) {
          setMessage({ type: "success", text: "Product added successfully!" });
          setProductName("");
          setBrand("");
          setCategory("");
          setOriginalPrice("");
          setOfferPrice("");
          setValidUntil("");
          setTemplateType("template1");
          setImage(null);

          // Navigate to view products page after successful addition
          setTimeout(() => {
            navigate("/view-products");
          }, 1000);
        } else {
          const data = await res.json().catch(() => ({}));
          setMessage({ type: "error", text: data?.detail || data?.error || "Failed to add product" });
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Request failed. Check backend/CORS/server logs." });
    } finally {
      setLoading(false);
    }
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
  };

  return (
    <div className="add-product-page">
      <div className="dashboard-container">
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onLogout={onLogout}
          userName={userData?.username || userData?.email || "User"}
        />

        <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <div className="product-container">
            <div className="page-header">
              <h1 className="page-title">{editMode ? "Edit Product" : "Add Product"}</h1>
              <p className="page-subtitle">
                {editMode ? "Update product details" : "Create a product under a category"}
              </p>
            </div>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)} 
                  placeholder="Enter product name"
                  required 
                  disabled={loading} 
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)} 
                  placeholder="Enter brand name"
                  disabled={loading} 
                />
              </div>

              {!editMode && (
                <>
                  <div className="form-group">
                    <label>Category *</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      required 
                      disabled={loading}
                      className="category-select"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                          {location.state?.categoryName === cat.name ? " (Recently Added)" : ""}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="form-hint">
                        No categories available. <a href="/add-category">Add a category first</a>
                      </p>
                    )}
                  </div>
                </>
              )}

              {editMode && (
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    value={category} 
                    disabled={true}
                    className="disabled-input"
                  />
                  <p className="form-hint">Category cannot be changed in edit mode</p>
                </div>
              )}

              <div className="form-group">
                <label>Original Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Enter original price"
                  required
                  disabled={loading}
                  className={priceError ? "error-input" : ""}
                />
              </div>

              <div className="form-group">
                <label>Offer Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Enter offer price"
                  required
                  disabled={loading}
                  className={priceError ? "error-input" : ""}
                />
                {priceError && (
                  <div className="price-error-message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="2"/>
                      <path d="M8 4v5M8 11h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {priceError}
                  </div>
                )}
              </div>

              {!editMode && (
                <div className="form-group">
                  <label>Valid Until (optional)</label>
                  <input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Template Type</label>
                <select value={templateType} onChange={(e) => setTemplateType(e.target.value)} disabled={loading}>
                  <option value="template1">Template 1</option>
                  <option value="template2">Template 2</option>
                  <option value="template3">Template 3</option>
                  <option value="template4">Template 4</option>
                </select>
              </div>

              <div className="form-group">
                <label>Image {editMode ? "(optional - leave blank to keep existing)" : "(optional)"}</label>
                {editMode && existingImage && (
                  <div className="existing-image-preview">
                    <img src={existingImage} alt="Current product" style={{ maxWidth: "200px", marginBottom: "10px" }} />
                    <p className="form-hint">Current image (upload new to replace)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImage(e.target.files?.[0] || null)} 
                  disabled={loading} 
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => navigate("/view-products")} disabled={loading}>
                  {editMode ? "Cancel" : "Back to Products"}
                </button>
                <button type="submit" disabled={loading || !!priceError}>
                  {loading ? (editMode ? "Updating..." : "Saving...") : (editMode ? "Update Product" : "Add Product")}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Price Validation Modal */}
      {showPriceModal && (
        <div className="modal-overlay" onClick={closePriceModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#ef4444" strokeWidth="3"/>
                <path d="M32 16v20M32 44h.02" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>

            <h2 className="modal-title">Invalid Price Configuration</h2>
            
            <p className="modal-message">
              The offer price must be lower than the original price to provide a valid discount to customers.
            </p>

            <div className="price-comparison">
              <div className="price-box original">
                <span className="price-label">Original Price</span>
                <span className="price-value">₹{parseFloat(originalPrice).toFixed(2)}</span>
              </div>
              
              <div className="arrow-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16h20M20 10l6 6-6 6" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="price-box offer error">
                <span className="price-label">Offer Price</span>
                <span className="price-value">₹{parseFloat(offerPrice).toFixed(2)}</span>
              </div>
            </div>

            <div className="example-box">
              <div className="example-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="2"/>
                  <path d="M6 10l3 3 5-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Correct Example
              </div>
              <div className="example-prices">
                <span>Original: ₹1000</span>
                <span className="example-arrow">→</span>
                <span className="highlight">Offer: ₹800</span>
                <span className="savings">(20% savings)</span>
              </div>
            </div>

            <button className="modal-button" onClick={closePriceModal}>
              Got it, I'll fix the prices
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddProduct;