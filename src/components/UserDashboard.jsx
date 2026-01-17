import React, { useState, useEffect } from "react";

export default function UserDashboard() {
  const [activePage, setActivePage] = useState("add-category");
  const [categories, setCategories] = useState([
    { id: 1, name: "Two Wheeler", image: null },
    { id: 2, name: "Cards", image: null },
    { id: 3, name: "Smartphones", image: null },
    { id: 4, name: "Electronics", image: null },
    { id: 5, name: "Accessories", image: null },
    { id: 6, name: "Men", image: null },
    { id: 7, name: "Women", image: null },
    { id: 8, name: "Grocery", image: null },
    { id: 9, name: "Sports", image: null }
  ]);

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    originalPrice: "",
    offerPrice: "",
    brand: "",
    category: "",
    image: null
  });

  // Offer state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [products, setProducts] = useState([]);
  
  // Category strip pause state
  const [isPaused, setIsPaused] = useState(false);
  
  // Category page view state
  const [viewingCategory, setViewingCategory] = useState(null);
  
  // Product category search
const [categorySearch, setCategorySearch] = useState("");

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // New state for enhanced offer generation
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    validUntil: "",
    discountType: "percentage",
    discountValue: "",
    category: "",
    template: ""
  });

  const [generatedOffer, setGeneratedOffer] = useState(null);

  useEffect(() => {
    if (!document.getElementById("category-strip-animation")) {
      const style = document.createElement("style");
      style.id = "category-strip-animation";
      style.innerHTML = `
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!categoryName) {
      alert("Please enter category name");
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      alert("Category already exists!");
      return;
    }

    const newCategory = {
      id: Date.now(),
      name: categoryName,
      image: categoryImage
    };

    setCategories([...categories, newCategory]);
    alert("Category added successfully!");
    setCategoryName("");
    setCategoryImage(null);
    setActivePage("add-product");
  };

  const handleUpdateCategoryImage = (categoryId, newImage) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, image: newImage } : cat
    ));
    alert("Category image updated successfully!");
    setEditingCategory(null);
  };

  const handleCategoryClick = (category) => {
    setViewingCategory(category);
    setActivePage("view-category");
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.originalPrice || !productForm.offerPrice) {
      alert("Please fill in all required fields");
      return;
    }

    const newProduct = {
      id: Date.now(),
      ...productForm
    };

    setProducts([...products, newProduct]);
    alert("Product added successfully!");
    setProductForm({
      name: "",
      originalPrice: "",
      offerPrice: "",
      brand: "",
      category: "",
      image: null
    });
    setActivePage("add-offer");
  };

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferForm({ ...offerForm, [name]: value });
  };

  const handleGenerateOffer = (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedTemplate || products.length === 0) {
      alert("Please select category, template, and add at least one product");
      return;
    }

    // Create the offer object
    const offerData = {
      id: `OFFER-${Date.now()}`,
      title: offerForm.title || `Special Offer - ${selectedCategory}`,
      description: offerForm.description || `Amazing deals on ${selectedCategory} products!`,
      category: selectedCategory,
      template: selectedTemplate,
      validUntil: offerForm.validUntil,
      discountType: offerForm.discountType,
      discountValue: offerForm.discountValue,
      products: products.filter(p => p.category === selectedCategory),
      generatedAt: new Date().toLocaleString(),
      status: "Active"
    };

    setGeneratedOffer(offerData);
    alert(`Offer generated successfully! 🎉\n\nOffer ID: ${offerData.id}\nCategory: ${selectedCategory}\nTemplate: ${selectedTemplate}\nProducts Included: ${offerData.products.length}`);
  };
  
  const handleViewOffer = () => {
    if (!selectedCategory || !selectedTemplate) {
      alert("Please select category and template first");
      return;
    }
    
    const offerData = {
      id: `OFFER-${Date.now()}`,
      title: offerForm.title || `Special Offer - ${selectedCategory}`,
      description: offerForm.description || `Amazing deals on ${selectedCategory} products!`,
      category: selectedCategory,
      template: selectedTemplate,
      validUntil: offerForm.validUntil,
      discountType: offerForm.discountType,
      discountValue: offerForm.discountValue,
      products: products.filter(p => p.category === selectedCategory),
      generatedAt: new Date().toISOString(),
      status: "Active"
    };

    // Navigate to offer view page
    window.open(`/offer/${offerData.id}`, '_blank');
  };

  const handleShareOffer = () => {
    if (!generatedOffer) return;
    
    // Simulate sharing functionality
    const offerUrl = `${window.location.origin}/offer/${generatedOffer.id}`;
    navigator.clipboard.writeText(offerUrl).then(() => {
      alert("Offer link copied to clipboard! 📋\n\nYou can now share this link with your customers.");
    });
  };

  const handleDownloadQR = () => {
    if (!generatedOffer) return;
    
    // Simulate QR code download
    const offerUrl = `${window.location.origin}/offer/${generatedOffer.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(offerUrl)}`;
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `offer-qr-${generatedOffer.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("QR Code downloaded successfully! 📱");
  };

  const calculateDiscount = (original, offer) => {
    return Math.round(((original - offer) / original) * 100);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (categoryName) => {
    setProductForm({ ...productForm, category: categoryName });
    setCategorySearch(categoryName);
    setShowCategoryDropdown(false);
  };

  // Function to select category from strip for manual entry
  const handleStripCategorySelect = (categoryName) => {
    setCategoryName(categoryName);
    setActivePage("add-category");
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
          min-height: 100vh;
        }

        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          background: white;
          border-bottom: 3px solid #00897b;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .nav-inner {
          max-width: 1400px;
          margin: auto;
          padding: 16px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          color: #00695c;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .menu {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .menu button {
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          background: #e0f2f1;
          color: #00695c;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .menu button:hover {
          background: #b2dfdb;
          transform: translateY(-2px);
        }

        .menu button.active {
          background: #00897b;
          color: white;
          border-color: #00695c;
        }

        .logout-btn {
          background: #d32f2f !important;
          color: white !important;
        }

        .logout-btn:hover {
          background: #b71c1c !important;
        }

        .category-strip-wrapper {
          position: fixed;
          top: 70px;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(90deg, #00897b 0%, #00695c 100%);
          padding: 14px 0;
          border-bottom: 3px solid #004d40;
          z-index: 999;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .category-strip {
          display: flex;
          gap: 20px;
          animation: scrollLeft 25s linear infinite;
          width: max-content;
        }

        .category-strip.paused {
          animation-play-state: paused;
        }

        .category-item {
          background: white;
          color: #00695c;
          padding: 10px 28px;
          border-radius: 999px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-item:hover {
          background: #fff9c4;
          transform: scale(1.05);
        }

        .dashboard-content {
          padding: 160px 30px 50px;
          display: flex;
          justify-content: center;
        }

        .container {
          width: 100%;
          max-width: 1200px;
        }

        .page-title {
          text-align: center;
          font-size: 36px;
          font-weight: 800;
          color: #004d40;
          margin-bottom: 40px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 3px solid #b2dfdb;
        }

        .card h2 {
          color: #00695c;
          margin-bottom: 25px;
          font-size: 24px;
          font-weight: 700;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #00695c;
          font-weight: 600;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #b2dfdb;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #00897b;
          box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .file-input-wrapper {
          position: relative;
          margin: 20px 0;
        }

        .file-input {
          padding: 12px;
          border: 2px dashed #00897b;
          border-radius: 12px;
          background: #e0f2f1;
          width: 100%;
        }

        .submit-btn {
          background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
          margin-top: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 137, 123, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4);
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .template-card {
          padding: 30px 20px;
          border: 3px solid #b2dfdb;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .template-card:hover {
          border-color: #00897b;
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 137, 123, 0.2);
        }

        .template-card.selected {
          background: #00897b;
          color: white;
          border-color: #00695c;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .product-card-item {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
        }

        .product-card-item h4 {
          color: #00695c;
          margin-bottom: 10px;
        }

        .product-card-item p {
          margin: 5px 0;
          color: #666;
        }

        .price-info {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-weight: 600;
        }

        .original-price {
          text-decoration: line-through;
          color: #999;
        }

        .offer-price {
          color: #00897b;
          font-size: 18px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .category-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #b2dfdb;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-card:hover {
          border-color: #00897b;
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 137, 123, 0.2);
        }

        .category-card h3 {
          color: #00695c;
          margin-bottom: 10px;
        }

        .category-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
          background: #e0e0e0;
        }

        .edit-btn {
          background: #ff9800;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 10px;
        }

        .edit-btn:hover {
          background: #f57c00;
        }

        .back-btn {
          background: #757575;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .back-btn:hover {
          background: #616161;
        }

        .category-dropdown-wrapper {
          position: relative;
        }

        .category-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #00897b;
          border-radius: 12px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .category-dropdown-item {
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #e0e0e0;
        }

        .category-dropdown-item:hover {
          background: #e0f2f1;
        }

        .category-dropdown-item:last-child {
          border-bottom: none;
        }

        /* New styles for enhanced offer generation */
        .offer-preview {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin-top: 30px;
          text-align: center;
        }
        
        .offer-preview h3 {
          margin-bottom: 15px;
          font-size: 24px;
        }
        
        .offer-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .stat-item {
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        
        .qr-code-container {
          margin-top: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          display: inline-block;
        }
        
        .template-preview {
          border: 3px solid #00897b;
          border-radius: 12px;
          padding: 20px;
          margin-top: 15px;
          background: #f8f9fa;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .secondary-btn {
          background: linear-gradient(135deg, #757575 0%, #616161 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .success-card {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin-top: 30px;
          text-align: center;
        }

        .strip-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px;
          background: #e0f2f1;
          border-radius: 12px;
          border: 2px solid #b2dfdb;
        }

        .strip-category-item {
          background: white;
          color: #00695c;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #b2dfdb;
        }

        .strip-category-item:hover {
          background: #00897b;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .category-section-title {
          color: #00695c;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .category-section-title:before {
          content: "📌";
        }

        .manual-entry-title {
          color: #00695c;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .manual-entry-title:before {
          content: "✏️";
        }

        @media (max-width: 768px) {
          .menu {
            gap: 8px;
          }

          .menu button {
            padding: 8px 12px;
            font-size: 12px;
          }

          .card {
            padding: 25px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
          
          .strip-selection-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 10px;
            padding: 15px;
          }
        }
      `}</style>

      {/* Navbar */}
      <div className="navbar">
        <div className="nav-inner">
          <div className="logo">OFFER LIVE</div>
          <div className="menu">
            <button
              className={activePage === "add-category" ? "active" : ""}
              onClick={() => setActivePage("add-category")}
            >
              1. Add Category
            </button>
            <button
              className={activePage === "add-product" ? "active" : ""}
              onClick={() => setActivePage("add-product")}
            >
              2. Add Product
            </button>
            <button
              className={activePage === "add-offer" ? "active" : ""}
              onClick={() => setActivePage("add-offer")}
            >
              3. Add Offer
            </button>
            <button
              className={activePage === "generate-offer" ? "active" : ""}
              onClick={() => setActivePage("generate-offer")}
            >
              4. Generate Offer
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

          {/* Moving Category Strip */}
          <div className="category-strip-wrapper">
            <div 
              className={`category-strip ${isPaused ? 'paused' : ''}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {[...categories, ...categories].map((cat, i) => (
                <div 
                  key={i} 
                  className="category-item"
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="dashboard-content">
            <div className="container">
              <h1 className="page-title">User Dashboard</h1>

              {/* Add Category Page */}
              {activePage === "add-category" && (
                <div className="card">
                  <h2>📁 Add New Category</h2>
                  
                {/* ✅ COMBO CATEGORY INPUT (DROPDOWN + MANUAL ENTRY) */}
    <div className="form-group category-dropdown-wrapper">
      <label className="form-label">Category Name *</label>

      <input
        type="text"
        className="form-input"
        placeholder="Select or type a new category"
        value={categoryName}
        onChange={(e) => {
          setCategoryName(e.target.value);
          setCategorySearch(e.target.value);
          setShowCategoryDropdown(true);
        }}
        onFocus={() => setShowCategoryDropdown(true)}
      />

      {/* ✅ Dropdown List */}
      {showCategoryDropdown && filteredCategories.length > 0 && (
        <div className="category-dropdown">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="category-dropdown-item"
              onClick={() => {
                setCategoryName(cat.name);
                setCategorySearch(cat.name);
                setShowCategoryDropdown(false);
              }}
            >
              {cat.name}
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="file-input-wrapper">
      <label className="form-label">Category Image (Optional)</label>
      <input
        type="file"
        className="file-input"
        accept="image/*"
        onChange={(e) => setCategoryImage(e.target.files[0])}
      />
    </div>

    <button onClick={handleAddCategory} className="submit-btn">
      Add Category
    </button>
    </div>
    )}

          

          {/* View Category Page */}
          {activePage === "view-category" && viewingCategory && (
            <div className="card">
              <button onClick={() => setActivePage("add-category")} className="back-btn">
                ← Back to Categories
              </button>
              <h2>📂 {viewingCategory.name}</h2>
              
              <div style={{display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap'}}>
                {/* Category Image Section */}
                <div style={{flex: '1', minWidth: '300px'}}>
                  {viewingCategory.image ? (
                    <img 
                      src={URL.createObjectURL(viewingCategory.image)} 
                      alt={viewingCategory.name}
                      style={{width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}
                    />
                  ) : (
                    <div style={{
                      width: '100%', 
                      maxWidth: '400px', 
                      height: '300px', 
                      background: '#e0e0e0', 
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      No Image
                    </div>
                  )}
                  
                  {/* Add/Update Image Button */}
                  <div style={{marginTop: '20px'}}>
                    {editingCategory === viewingCategory.id ? (
                      <div>
                        <input
                          type="file"
                          className="file-input"
                          accept="image/*"
                          onChange={(e) => {
                            handleUpdateCategoryImage(viewingCategory.id, e.target.files[0]);
                            setViewingCategory({...viewingCategory, image: e.target.files[0]});
                          }}
                        />
                        <button 
                          onClick={() => setEditingCategory(null)}
                          style={{
                            background: '#757575',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginTop: '10px',
                            fontSize: '12px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="edit-btn"
                        onClick={() => setEditingCategory(viewingCategory.id)}
                        style={{padding: '10px 20px', fontSize: '14px'}}
                      >
                        {viewingCategory.image ? '📸 Update Image' : '📸 Add Image'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Stats */}
                <div style={{flex: '1', minWidth: '300px'}}>
                  <div style={{background: '#e0f2f1', padding: '20px', borderRadius: '12px'}}>
                    <h3 style={{color: '#00695c', marginBottom: '15px'}}>📊 Category Statistics</h3>
                    <div style={{marginTop: '15px'}}>
                      <p style={{marginBottom: '10px', fontSize: '16px'}}>
                        <strong>Total Products:</strong> {products.filter(p => p.category === viewingCategory.name).length}
                      </p>
                      <p style={{marginBottom: '10px', fontSize: '16px'}}>
                        <strong>Status:</strong> <span style={{color: '#00897b', fontWeight: '600'}}>Active</span>
                      </p>
                      <p style={{marginBottom: '10px', fontSize: '16px'}}>
                        <strong>Created:</strong> Recently
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div style={{marginTop: '40px'}}>
                <h3 style={{color: '#00695c', marginBottom: '20px', fontSize: '22px'}}>🛍️ Products in this category</h3>
                {products.filter(p => p.category === viewingCategory.name).length > 0 ? (
                  <div className="product-list">
                    {products.filter(p => p.category === viewingCategory.name).map((product) => (
                      <div key={product.id} className="product-card-item">
                        <h4>{product.name}</h4>
                        <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
                        <div className="price-info">
                          <span className="original-price">₹{product.originalPrice}</span>
                          <span className="offer-price">₹{product.offerPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    background: '#fff3e0',
                    padding: '30px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px dashed #ff9800'
                  }}>
                    <p style={{color: '#e65100', fontSize: '16px', fontWeight: '600'}}>
                      📦 No products added to this category yet.
                    </p>
                    <button 
                      onClick={() => setActivePage("add-product")}
                      style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '15px',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      ➕ Add Products Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Product Page */}
          {activePage === "add-product" && (
            <div className="card">
              <h2>🛍️ Add New Product</h2>
              <div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="Enter product name"
                      value={productForm.name}
                      onChange={handleProductChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Original Price *</label>
                    <input
                      type="number"
                      name="originalPrice"
                      className="form-input"
                      placeholder="₹ 0"
                      value={productForm.originalPrice}
                      onChange={handleProductChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Offer Price *</label>
                    <input
                      type="number"
                      name="offerPrice"
                      className="form-input"
                      placeholder="₹ 0"
                      value={productForm.offerPrice}
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

                  <div className="form-group category-dropdown-wrapper">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-input"
                      name="category"
                      value={productForm.category}
                      onChange={handleProductChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="file-input-wrapper">
                  <label className="form-label">Product Image</label>
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                  />
                </div>

                <button onClick={handleAddProduct} className="submit-btn">
                  Add Product
                </button>
              </div>

              {products.length > 0 && (
                <>
                  <h3 style={{marginTop: '40px', color: '#00695c'}}>Added Products ({products.length})</h3>
                  <div className="product-list">
                    {products.map((product) => (
                      <div key={product.id} className="product-card-item">
                        <h4>{product.name}</h4>
                        <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                        <div className="price-info">
                          <span className="original-price">₹{product.originalPrice}</span>
                          <span className="offer-price">₹{product.offerPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add Offer Page */}
          {activePage === "add-offer" && (
            <div className="card">
              <h2>🎯 Configure Your Offer</h2>
              
              <div className="form-group">
                <label className="form-label">Select Category *</label>
                <select
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Choose Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '30px' }}>
                <label className="form-label">Select Template *</label>
                <div className="template-grid">
                  {['Template 1', 'Template 2', 'Template 3', 'Template 4'].map((template, i) => (
                    <div
                      key={i}
                      className={`template-card ${selectedTemplate === template ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setActivePage("generate-offer");
                      }}
                    >
                      <h3>{template}</h3>
                      <p style={{ marginTop: '10px', fontSize: '14px' }}>Click to select</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Offer Page */}
          {activePage === "generate-offer" && (
            <div className="card">
              <h2>✨ Generate Your Offer</h2>
              
              {!generatedOffer ? (
                <form onSubmit={handleGenerateOffer}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Offer Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="Enter offer title"
                        value={offerForm.title}
                        onChange={handleOfferChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        name="category"
                        className="form-input"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Template *</label>
                      <select
                        name="template"
                        className="form-input"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        required
                      >
                        <option value="">Select Template</option>
                        <option value="modern">Modern Template</option>
                        <option value="classic">Classic Template</option>
                        <option value="minimal">Minimal Template</option>
                        <option value="bold">Bold Template</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Valid Until</label>
                      <input
                        type="date"
                        name="validUntil"
                        className="form-input"
                        value={offerForm.validUntil}
                        onChange={handleOfferChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Offer Description</label>
                    <textarea
                      name="description"
                      className="form-input"
                      placeholder="Describe your offer..."
                      rows="3"
                      value={offerForm.description}
                      onChange={handleOfferChange}
                    />
                  </div>

                  {/* Offer Preview */}
                  {selectedCategory && (
                    <div className="offer-preview">
                      <h3>🎯 Offer Preview</h3>
                      <p><strong>{offerForm.title || `Special Offer - ${selectedCategory}`}</strong></p>
                      <p>{offerForm.description || `Amazing deals on ${selectedCategory} products!`}</p>
                      
                      <div className="offer-stats">
                        <div className="stat-item">
                          <strong>Products</strong>
                          <p>{products.filter(p => p.category === selectedCategory).length}</p>
                        </div>
                        <div className="stat-item">
                          <strong>Category</strong>
                          <p>{selectedCategory}</p>
                        </div>
                        <div className="stat-item">
                          <strong>Template</strong>
                          <p>{selectedTemplate}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="submit-btn">
                    🚀 Generate Offer & QR Code
                  </button>
                </form>
              ) : (
                <div className="success-card">
                  <h3>✅ Offer Generated Successfully!</h3>
                  <div className="offer-stats">
                    <div className="stat-item">
                      <strong>Offer ID</strong>
                      <p>{generatedOffer.id}</p>
                    </div>
                    <div className="stat-item">
                      <strong>Category</strong>
                      <p>{generatedOffer.category}</p>
                    </div>
                    <div className="stat-item">
                      <strong>Products</strong>
                      <p>{generatedOffer.products.length}</p>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    <button onClick={handleShareOffer} className="secondary-btn">
                      📋 Copy Shareable Link
                    </button>
                    <button onClick={handleDownloadQR} className="secondary-btn">
                      📱 Download QR Code
                    </button>
                    <button 
                      onClick={() => setGeneratedOffer(null)} 
                      className="submit-btn"
                      style={{marginTop: '0'}}
                    >
                      🆕 Create New Offer
                    </button>
                  </div>
                </div>
              )}

              {products.length === 0 && !generatedOffer && (
                <div style={{
                  background: '#ffebee',
                  padding: '20px',
                  borderRadius: '12px',
                  marginTop: '20px',
                  border: '2px solid #f44336'
                }}>
                  <p style={{color: '#d32f2f', fontWeight: '600'}}>
                    ⚠️ Please add at least one product before generating an offer.
                  </p>
                  <button 
                    onClick={() => setActivePage("add-product")}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Add Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}