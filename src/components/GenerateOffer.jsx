// File: src/components/GenerateOffer.jsx
import React, { useState, useEffect } from "react";
import API, { setAuthToken } from "../services/api";
import { generateQRCode, downloadQRCode } from "../services/qrService";

export default function GenerateOffer() {
  const [activePage, setActivePage] = useState("select-category");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedOffer, setGeneratedOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    product_name: "",
    original_price: "",
    offer_price: "",
    brand: "",
    image: null
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access");
      if (token) setAuthToken(token);
      const response = await API.get("categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await API.get("products/");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActivePage("add-products");
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const handleImageChange = (e) => {
    setProductForm({ ...productForm, image: e.target.files[0] });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.product_name || !productForm.original_price || !productForm.offer_price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("product_name", productForm.product_name);
      formData.append("original_price", productForm.original_price);
      formData.append("offer_price", productForm.offer_price);
      formData.append("brand", productForm.brand);
      formData.append("category", selectedCategory.name);
      formData.append("template_type", "template1");
      if (productForm.image) {
        formData.append("image", productForm.image);
      }

      await API.post("products/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Product added successfully!");
      setProductForm({
        product_name: "",
        original_price: "",
        offer_price: "",
        brand: "",
        image: null
      });
      fetchProducts();
    } catch (error) {
      alert("Failed to add product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleGenerateOffer = async () => {
    if (!selectedCategory || !selectedTemplate || selectedProducts.length === 0) {
      alert("Please select category, products, and template");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("offers/create/", {
        category_id: selectedCategory.id,
        template_type: selectedTemplate.type,
        product_ids: selectedProducts.map(p => p.id)
      });

      setGeneratedOffer(response.data);
      setActivePage("view-offer");
      alert("Offer generated successfully! 🎉");
    } catch (error) {
      alert("Failed to generate offer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { id: 1, name: "Modern Gradient", type: "template1", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: 2, name: "Fresh Green", type: "template2", color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
    { id: 3, name: "Sunset Orange", type: "template3", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: 4, name: "Ocean Blue", type: "template4", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }
  ];

  const categoryProducts = products.filter(p => p.category === selectedCategory?.name);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .dashboard-wrapper {
          padding: 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          color: white;
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .header p {
          color: rgba(255,255,255,0.9);
          font-size: 18px;
        }

        .progress-bar {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .progress-step {
          background: rgba(255,255,255,0.2);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .progress-step.active {
          background: white;
          color: #667eea;
          border-color: white;
          transform: scale(1.05);
        }

        .progress-step:hover {
          transform: translateY(-2px);
        }

        .card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card h2 {
          color: #667eea;
          margin-bottom: 30px;
          font-size: 28px;
          font-weight: 700;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .category-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 30px 20px;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 3px solid transparent;
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: #667eea;
        }

        .category-card.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #764ba2;
        }

        .category-card h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .category-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          margin-right: 10px;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .product-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border: 3px solid #e0e0e0;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .product-card:hover {
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .product-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }

        .product-card.selected::after {
          content: "✓";
          position: absolute;
          top: 10px;
          right: 10px;
          background: #667eea;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .product-card h4 {
          color: #333;
          margin-bottom: 10px;
          font-size: 18px;
        }

        .product-card p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }

        .product-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .price-info {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
        }

        .original-price {
          text-decoration: line-through;
          color: #999;
          font-size: 16px;
        }

        .offer-price {
          color: #667eea;
          font-size: 22px;
          font-weight: 700;
        }

        .discount-badge {
          background: #ff4757;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 8px;
          display: inline-block;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .template-card {
          padding: 40px 20px;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          border: 4px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .template-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          opacity: 0.9;
          z-index: 0;
        }

        .template-card > * {
          position: relative;
          z-index: 1;
        }

        .template-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }

        .template-card.selected {
          border-color: white;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        .template-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .offer-preview {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 16px;
          margin-top: 30px;
        }

        .offer-preview h3 {
          color: #667eea;
          margin-bottom: 20px;
        }

        .qr-container {
          text-align: center;
          margin: 30px 0;
        }

        .qr-container img {
          max-width: 300px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .offer-link {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          border: 2px solid #667eea;
        }

        .selected-count {
          background: #667eea;
          color: white;
          padding: 10px 20px;
          border-radius: 50px;
          display: inline-block;
          margin: 20px 0;
          font-weight: 600;
        }

        .file-input-wrapper {
          margin: 20px 0;
        }

        .file-input {
          padding: 12px;
          border: 2px dashed #667eea;
          border-radius: 12px;
          background: rgba(102, 126, 234, 0.05);
          width: 100%;
        }

        .back-to-dashboard {
          position: fixed;
          top: 20px;
          left: 20px;
          background: white;
          color: #667eea;
          padding: 12px 24px;
          border-radius: 12px;
          border: 2px solid #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .back-to-dashboard:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 32px;
          }

          .card {
            padding: 25px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <button 
        className="back-to-dashboard"
        onClick={() => window.location.href = "/user-dashboard"}
      >
        ← Back to Dashboard
      </button>
      <button onClick={handleViewOffer} className="secondary-btn">
  👁️ Preview Offer
        </button>

      <div className="dashboard-wrapper">
        <div className="header">
          <h1>🎁 Offer Generator Pro</h1>
          <p>Create stunning offers in 4 simple steps</p>
        </div>

        <div className="progress-bar">
          <div 
            className={`progress-step ${activePage === "select-category" ? "active" : ""}`}
            onClick={() => setActivePage("select-category")}
          >
            1️⃣ Select Category
          </div>
          <div 
            className={`progress-step ${activePage === "add-products" ? "active" : ""}`}
            onClick={() => selectedCategory && setActivePage("add-products")}
          >
            2️⃣ Add Products
          </div>
          <div 
            className={`progress-step ${activePage === "select-template" ? "active" : ""}`}
            onClick={() => selectedProducts.length > 0 && setActivePage("select-template")}
          >
            3️⃣ Choose Template
          </div>
          <div 
            className={`progress-step ${activePage === "view-offer" ? "active" : ""}`}
          >
            4️⃣ Generate Offer
          </div>
        </div>

        {/* Step 1: Select Category */}
        {activePage === "select-category" && (
          <div className="card">
            <h2>📁 Select a Category</h2>
            {categories.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                <p style={{fontSize: '18px', marginBottom: '20px'}}>No categories available. Please add categories first.</p>
                <button 
                  className="btn"
                  onClick={() => window.location.href = "/user-dashboard"}
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="category-grid">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-card ${selectedCategory?.id === category.id ? "selected" : ""}`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category.image && (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="category-image"
                      />
                    )}
                    <h3>{category.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Add Products */}
        {activePage === "add-products" && (
          <div className="card">
            <h2>🛍️ Add Products to {selectedCategory?.name}</h2>
            
            <div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="product_name"
                    className="form-input"
                    placeholder="Enter product name"
                    value={productForm.product_name}
                    onChange={handleProductChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original Price *</label>
                  <input
                    type="number"
                    name="original_price"
                    className="form-input"
                    placeholder="₹ 0"
                    value={productForm.original_price}
                    onChange={handleProductChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Offer Price *</label>
                  <input
                    type="number"
                    name="offer_price"
                    className="form-input"
                    placeholder="₹ 0"
                    value={productForm.offer_price}
                    onChange={handleProductChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-input"
                    placeholder="Enter brand name"
                    value={productForm.brand}
                    onChange={handleProductChange}
                  />
                </div>
              </div>

              <div className="file-input-wrapper">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <button 
                onClick={handleAddProduct} 
                className="btn" 
                disabled={loading}
              >
                {loading ? "Adding..." : "➕ Add Product"}
              </button>
            </div>

            {categoryProducts.length > 0 && (
              <>
                <h3 style={{marginTop: '40px', color: '#333'}}>
                  Select Products for Offer 
                  <span className="selected-count">
                    {selectedProducts.length} selected
                  </span>
                </h3>
                <div className="product-list">
                  {categoryProducts.map((product) => {
                    const discount = Math.round(((product.original_price - product.offer_price) / product.original_price) * 100);
                    return (
                      <div
                        key={product.id}
                        className={`product-card ${selectedProducts.find(p => p.id === product.id) ? "selected" : ""}`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.product_name}
                            className="product-image"
                          />
                        )}
                        <h4>{product.product_name}</h4>
                        {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
                        <div className="discount-badge">{discount}% OFF</div>
                        <div className="price-info">
                          <span className="original-price">₹{product.original_price}</span>
                          <span className="offer-price">₹{product.offer_price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  className="btn" 
                  style={{marginTop: '30px'}}
                  onClick={() => setActivePage("select-template")}
                  disabled={selectedProducts.length === 0}
                >
                  Continue to Template Selection →
                </button>
              </>
            )}

            {categoryProducts.length === 0 && (
              <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                <p style={{fontSize: '16px'}}>No products in this category yet. Add your first product above!</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select Template */}
        {activePage === "select-template" && (
          <div className="card">
            <h2>🎨 Choose Your Template</h2>
            <p style={{color: '#666', marginBottom: '20px'}}>
              Select a template design for your offer. {selectedProducts.length} products selected.
            </p>

            <div className="template-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? "selected" : ""}`}
                  style={{background: template.color}}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <h3>{template.name}</h3>
                  <p>Click to select</p>
                  {selectedTemplate?.id === template.id && (
                    <div style={{marginTop: '10px', fontSize: '24px'}}>✓</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{marginTop: '40px', textAlign: 'center'}}>
              <button 
                className="btn btn-secondary"
                onClick={() => setActivePage("add-products")}
              >
                ← Back
              </button>
              <button 
                className="btn"
                onClick={handleGenerateOffer}
                disabled={!selectedTemplate || loading}
              >
                {loading ? "Generating..." : "🚀 Generate Offer"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: View Generated Offer */}
        {activePage === "view-offer" && generatedOffer && (
          <div className="card">
            <h2>✨ Your Offer is Ready!</h2>
            
            <div className="offer-preview">
              <h3>Offer Details</h3>
              <p><strong>Category:</strong> {selectedCategory?.name}</p>
              <p><strong>Template:</strong> {selectedTemplate?.name}</p>
              <p><strong>Products:</strong> {selectedProducts.length}</p>
              <p><strong>Created:</strong> {new Date().toLocaleDateString()}</p>
            </div>

            <div className="qr-container">
              <h3>📱 QR Code</h3>
              {generatedOffer.qr_url ? (
                <>
                  <img src={generatedOffer.qr_url} alt="Offer QR Code" />
                  <p style={{marginTop: '10px', color: '#666'}}>Share this QR code with customers</p>
                  <button 
                    className="btn"
                    style={{marginTop: '15px'}}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedOffer.qr_url;
                      link.download = `offer-qr-${generatedOffer.id}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    📥 Download QR Code
                  </button>
                </>
              ) : (
                <p>QR Code generating...</p>
              )}
            </div>

            <div>
              <h3>🔗 Share Link</h3>
              <div className="offer-link">
                {generatedOffer.offer_link}
              </div>
              <button 
                className="btn"
                onClick={() => {
                  navigator.clipboard.writeText(generatedOffer.offer_link);
                  alert("Link copied to clipboard!");
                }}
              >
                📋 Copy Link
              </button>
            </div>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
              <button 
                className="btn"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedProducts([]);
                  setSelectedTemplate(null);
                  setGeneratedOffer(null);
                  setActivePage("select-category");
                }}
              >
                ✨ Create Another Offer
              </button>
              <button 
                className="btn btn-secondary"
                style={{marginLeft: '10px'}}
                onClick={() => window.location.href = "/user-dashboard"}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}