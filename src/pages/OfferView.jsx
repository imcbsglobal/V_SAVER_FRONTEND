import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const OfferView = () => {
  const { offerId } = useParams();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  // Sample offer data - in real app, this would come from API
  const sampleOffer = {
    id: offerId || 'OFFER-123456',
    title: 'Summer Special Discount',
    description: 'Get amazing deals on all electronics with up to 50% off! Limited time offer.',
    category: 'Electronics',
    template: 'modern',
    validUntil: '2024-12-31',
    discountType: 'percentage',
    discountValue: '50',
    products: [
      {
        id: 1,
        name: 'Wireless Headphones',
        originalPrice: '2999',
        offerPrice: '1999',
        brand: 'SoundMax',
        category: 'Electronics'
      },
      {
        id: 2,
        name: 'Smart Watch',
        originalPrice: '5999',
        offerPrice: '3999',
        brand: 'TechFit',
        category: 'Electronics'
      },
      {
        id: 3,
        name: 'Bluetooth Speaker',
        originalPrice: '2499',
        offerPrice: '1499',
        brand: 'AudioPro',
        category: 'Electronics'
      }
    ],
    generatedAt: '2024-01-15T10:30:00',
    status: 'Active'
  };

  useEffect(() => {
    // If offer data is passed via state, use it
    if (location.state?.offer) {
      setOffer(location.state.offer);
      setSelectedTemplate(location.state.offer.template || 'modern');
    } else {
      // Otherwise use sample data
      setOffer(sampleOffer);
    }
  }, [location.state, offerId]);

  const calculateDiscount = (original, offer) => {
    return Math.round(((original - offer) / original) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const shareOffer = () => {
    const offerUrl = window.location.href;
    navigator.clipboard.writeText(offerUrl).then(() => {
      alert('Offer link copied to clipboard!');
    });
  };

  if (!offer) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Loading Offer...</h2>
          <div style={{ color: '#666' }}>Please wait while we load your offer.</div>
        </div>
      </div>
    );
  }

  // Modern Template
  const ModernTemplate = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '25px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            margin: '0 0 10px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {offer.title}
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            margin: '0', 
            opacity: '0.9',
            fontWeight: '300'
          }}>
            {offer.description}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{offer.products.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Products</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{offer.discountValue}%</div>
              <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Discount</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {formatDate(offer.validUntil)}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Valid Until</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ padding: '40px 30px' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#333',
            fontSize: '2.2rem',
            marginBottom: '40px',
            fontWeight: '700'
          }}>
            Featured Products
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {offer.products.map((product) => (
              <div key={product.id} style={{
                background: '#f8f9fa',
                borderRadius: '20px',
                padding: '25px',
                border: '2px solid #e9ecef',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{product.name}</h3>
                  <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>{product.brand}</div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#666',
                      textDecoration: 'line-through'
                    }}>
                      ₹{product.originalPrice}
                    </div>
                    <div style={{
                      fontSize: '1.8rem',
                      color: '#00b894',
                      fontWeight: '700'
                    }}>
                      ₹{product.offerPrice}
                    </div>
                  </div>
                  <div style={{
                    background: '#ff7675',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }}>
                    {calculateDiscount(product.originalPrice, product.offerPrice)}% OFF
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#2d3436',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
            🎉 Don't miss this amazing opportunity!
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.7' }}>
            Offer ID: {offer.id} | Generated on {formatDate(offer.generatedAt)}
          </div>
          <button onClick={shareOffer} style={{
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'all 0.3s ease'
          }} onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
          }} onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}>
            📋 Share This Offer
          </button>
        </div>
      </div>
    </div>
  );

  // Classic Template
  const ClassicTemplate = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '20px',
      fontFamily: "'Georgia', serif"
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        border: '3px solid #e9ecef'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            margin: '0 0 15px 0',
            fontFamily: "'Playfair Display', serif"
          }}>
            {offer.title}
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            margin: '0', 
            opacity: '0.9',
            fontStyle: 'italic'
          }}>
            {offer.description}
          </p>
        </div>

        {/* Products */}
        <div style={{ padding: '30px' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#333',
            fontSize: '1.8rem',
            marginBottom: '30px',
            fontWeight: '600',
            borderBottom: '2px solid #4facfe',
            paddingBottom: '10px'
          }}>
            Special Offers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {offer.products.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '10px',
                padding: '20px',
                border: '1px solid #ddd',
                textAlign: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ 
                  color: '#333', 
                  margin: '0 0 10px 0',
                  fontSize: '1.3rem'
                }}>{product.name}</h3>
                <div style={{ 
                  color: '#666', 
                  fontSize: '0.9rem',
                  marginBottom: '15px'
                }}>{product.brand}</div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    color: '#999',
                    textDecoration: 'line-through',
                    fontSize: '1.1rem'
                  }}>₹{product.originalPrice}</span>
                  <span style={{
                    color: '#e74c3c',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>₹{product.offerPrice}</span>
                </div>
                <div style={{
                  background: '#e74c3c',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  Save {calculateDiscount(product.originalPrice, product.offerPrice)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#2c3e50',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
            Valid until {formatDate(offer.validUntil)} | {offer.products.length} products available
          </div>
        </div>
      </div>
    </div>
  );

  // Minimal Template
  const MinimalTemplate = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      padding: '20px',
      fontFamily: "'Helvetica Neue', Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '10px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{
          padding: '40px 30px',
          textAlign: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <h1 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '300', 
            margin: '0 0 10px 0',
            color: '#333',
            letterSpacing: '1px'
          }}>
            {offer.title}
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            margin: '0', 
            color: '#666',
            lineHeight: '1.6'
          }}>
            {offer.description}
          </p>
        </div>

        {/* Products */}
        <div style={{ padding: '30px' }}>
          {offer.products.map((product, index) => (
            <div key={product.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px',
              borderBottom: index === offer.products.length - 1 ? 'none' : '1px solid #eee',
              gap: '20px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.8rem'
              }}>
                {product.name.split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '5px'
                }}>{product.name}</div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666'
                }}>{product.brand}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    color: '#999',
                    textDecoration: 'line-through',
                    fontSize: '0.9rem'
                  }}>₹{product.originalPrice}</span>
                  <span style={{
                    color: '#2ecc71',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>₹{product.offerPrice}</span>
                </div>
                <div style={{
                  color: '#e74c3c',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  marginTop: '5px'
                }}>
                  {calculateDiscount(product.originalPrice, product.offerPrice)}% off
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          textAlign: 'center',
          borderTop: '1px solid #eee',
          color: '#666',
          fontSize: '0.8rem'
        }}>
          Offer ends {formatDate(offer.validUntil)}
        </div>
      </div>
    </div>
  );

  // Render selected template
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate />;
      case 'classic':
        return <ClassicTemplate />;
      case 'minimal':
        return <MinimalTemplate />;
      default:
        return <ModernTemplate />;
    }
  };

  return (
    <div>
      {renderTemplate()}
      
      {/* Template Selector (for demo purposes) */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#333',
          fontSize: '0.9rem'
        }}>
          Template:
        </label>
        <select 
          value={selectedTemplate} 
          onChange={(e) => setSelectedTemplate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '0.9rem',
            width: '120px'
          }}
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    </div>
  );
};

export default OfferView;