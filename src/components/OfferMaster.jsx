import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './OfferMaster.scss';
import API from '../services/api';

const OfferMaster = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [offers, setOffers] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('branches'); // 'branches', 'offers', or 'all-offers'

  useEffect(() => {
    fetchAllPublicBranches();
    fetchAllOffersFromPublic();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAllPublicBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/public/branches/`);
      if (data.success && data.branches) {
        setBranches(data.branches);
        if (data.branches.length > 0) {
          handleBranchSelect(data.branches[0]);
        } else {
          setViewMode('all-offers');
        }
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load branches');
      setViewMode('all-offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOffersFromPublic = async () => {
    try {
      const { data } = await API.get(`/public/offers/`);
      if (data.success && data.offers) {
        setAllOffers(data.offers);
      }
    } catch (err) {
      console.error('Error fetching public offers:', err);
    }
  };

  const fetchAllOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/public/offers/`);
      if (data.success && data.offers) {
        setAllOffers(data.offers);
        setViewMode('all-offers');
      }
    } catch (err) {
      console.error('Error fetching all offers:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load all offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchOffers = async (branch) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/public/offers/?branch_id=${branch.id}`);
      if (data.success) {
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = async (branch) => {
    setSelectedBranch(branch);
    setViewMode('offers');
    await fetchBranchOffers(branch);
  };

  const handleViewAllOffers = () => {
    fetchAllOffers();
  };

  const handleBackToBranches = () => {
    setViewMode('branches');
    setSelectedBranch(null);
    setOffers([]);
    setFilterStatus('all');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // ✅ FIXED: was removing 'user_data' (wrong key) and missing refresh_token
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    if (onLogout) onLogout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFilteredOffers = (offersList) => {
    return offersList.filter(offer => {
      if (filterStatus === 'all') return true;
      return offer.status === filterStatus;
    });
  };

  const filteredOffers = getFilteredOffers(offers);
  const filteredAllOffers = getFilteredOffers(allOffers);

  const getOfferStatus = (offer) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validFrom = new Date(offer.valid_from);
    validFrom.setHours(0, 0, 0, 0);
    const validTo = new Date(offer.valid_to);
    validTo.setHours(23, 59, 59, 999);
    if (today < validFrom) return 'upcoming';
    else if (today > validTo) return 'expired';
    else return 'active';
  };

  const isOfferValid = (offer) => {
    return getOfferStatus(offer) === 'active';
  };

  const renderOfferCard = (offer, showBranchContext = false) => (
    <div key={offer.id} className={`offer-card ${isOfferValid(offer) ? 'valid-offer' : 'expired-offer'}`}>
      {(() => {
        const status = getOfferStatus(offer);
        if (status === 'active') {
          return (
            <div className="validity-badge active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Currently Valid
            </div>
          );
        } else if (status === 'upcoming') {
          return (
            <div className="validity-badge upcoming">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Starts Soon
            </div>
          );
        }
        return null;
      })()}

      {offer.media_files && offer.media_files.length > 0 && (
        <div className="offer-media-list">
          {offer.media_files.map((media) => (
            <div key={media.id} className="individual-media-card view-only">
              <div className="media-card-header">
                <h4>{offer.title}</h4>
              </div>
              <div className="media-card-content">
                {media.media_type === 'image' ? (
                  <img src={media.file_url} alt={media.caption || offer.title} />
                ) : (
                  <div className="pdf-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>PDF Document</span>
                    <a 
                      href={media.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      View PDF
                    </a>
                  </div>
                )}
                {media.caption && (
                  <p className="media-caption">{media.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="offer-content">
        <div className="offer-header">
          <h3>{offer.title}</h3>
          <span className={`status-badge ${offer.status}`}>
            {offer.status}
          </span>
        </div>
        {offer.description && (
          <p className="offer-description">{offer.description}</p>
        )}
        <div className="offer-details">
          <div className="detail-item">
            <strong>📅 Valid Period:</strong>
          </div>
          <div className="detail-item">
            From: {formatDate(offer.valid_from)}
          </div>
          <div className="detail-item">
            To: {formatDate(offer.valid_to)}
          </div>
          {offer.media_count > 0 && (
            <div className="detail-item">
              <strong>📎 Attachments:</strong> {offer.media_count} file{offer.media_count !== 1 ? 's' : ''}
            </div>
          )}
          <div className="detail-item">
            <strong>📍 Status:</strong> 
            {(() => {
              const status = getOfferStatus(offer);
              if (status === 'active') return ' ✅ Active Now';
              else if (status === 'upcoming') return ' 🕒 Starts Soon';
              else return ' ❌ Expired';
            })()}
          </div>
        </div>
        
        {offer.branches && offer.branches.length > 0 && (
          <div className="offer-all-branches-info" style={{
            backgroundColor: '#f0f9ff',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px',
            border: '1px solid #3b82f6'
          }}>
            <h4 style={{
              color: '#1e40af',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 8px 0'
            }}>
              📍 Valid at {offer.branch_count} branch{offer.branch_count > 1 ? 'es' : ''}:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {offer.branches.slice(0, 5).map(branch => (
                <span 
                  key={branch.id} 
                  style={{
                    background: selectedBranch && branch.id === selectedBranch.id ? '#10b981' : '#3b82f6',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const branchToSelect = branches.find(b => b.id === branch.id);
                    if (branchToSelect) handleBranchSelect(branchToSelect);
                  }}
                  title="Click to view this branch's offers"
                >
                  {branch.branch_name}
                  {selectedBranch && branch.id === selectedBranch.id && ' ✓'}
                </span>
              ))}
              {offer.branches.length > 5 && (
                <span style={{
                  background: '#1e40af',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  +{offer.branches.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="info-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Offers are managed by administrators</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="offer-master-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={handleToggleSidebar}
        userData={userData}
        onLogout={handleLogout}
      />
      
      <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        <div className="content-wrapper">
          <div className="page-header">
            <div className="header-content">
              {(viewMode === 'offers' || viewMode === 'all-offers') && (
                <button className="back-btn" onClick={handleBackToBranches}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Branches
                </button>
              )}
              <h1>
                {viewMode === 'branches' && 'Discover Offers by Branch'}
                {viewMode === 'offers' && selectedBranch && `Offers at ${selectedBranch.branch_name}`}
                {viewMode === 'all-offers' && 'All Available Offers'}
              </h1>
              {viewMode === 'branches' && (
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  Browse all branches and their offers from different shops
                </p>
              )}
            </div>

            {error && (
              <div className="error-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Branch Selection View */}
          {viewMode === 'branches' && (
            <>
              {branches.length > 0 && (
                <div className="view-options" style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button 
                    className="btn-primary"
                    onClick={handleViewAllOffers}
                    style={{
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    View All Offers from All Branches
                  </button>
                </div>
              )}

              <div className="branches-grid">
                {loading ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p>Loading branches...</p>
                  </div>
                ) : branches.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <p>No branches available yet</p>
                    <small>Check back later for new branches and offers</small>
                  </div>
                ) : (
                  branches.map(branch => (
                    <div 
                      key={branch.id} 
                      className="branch-card"
                      onClick={() => handleBranchSelect(branch)}
                    >
                      {branch.branch_image_url && (
                        <div className="branch-image">
                          <img src={branch.branch_image_url} alt={branch.branch_name} />
                        </div>
                      )}
                      <div className="branch-info">
                        <h3>{branch.branch_name}</h3>
                        <p className="branch-code">Code: {branch.branch_code}</p>
                        {branch.user_info && branch.user_info.shop_name && (
                          <p className="shop-owner" style={{
                            fontSize: '13px',
                            color: '#3b82f6',
                            fontWeight: '600',
                            marginTop: '4px'
                          }}>
                            🏪 {branch.user_info.shop_name}
                          </p>
                        )}
                        <p className="branch-location">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {branch.location}
                        </p>
                        {branch.active_offers_count > 0 && (
                          <p className="offers-count" style={{
                            fontSize: '13px',
                            color: '#10b981',
                            fontWeight: '600',
                            marginTop: '8px'
                          }}>
                            🎉 {branch.active_offers_count} Active Offer{branch.active_offers_count !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="branch-action">
                        <button className="view-offers-btn">
                          View Offers
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Single Branch Offers View */}
          {viewMode === 'offers' && selectedBranch && (
            <>
              <div className="filters-bar">
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    All Offers ({offers.length})
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('active')}
                  >
                    Active ({offers.filter(o => o.status === 'active').length})
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('inactive')}
                  >
                    Inactive ({offers.filter(o => o.status === 'inactive').length})
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('scheduled')}
                  >
                    Scheduled ({offers.filter(o => o.status === 'scheduled').length})
                  </button>
                </div>
              </div>

              <div className="offers-container">
                {loading ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p>Loading offers...</p>
                  </div>
                ) : filteredOffers.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>No offers available</p>
                    <small>Check back later for new offers at this branch</small>
                  </div>
                ) : (
                  <div className="offers-grid">
                    {filteredOffers.map(offer => renderOfferCard(offer, false))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* All Offers View */}
          {viewMode === 'all-offers' && (
            <>
              <div className="filters-bar">
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    All Offers ({allOffers.length})
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('active')}
                  >
                    Active ({allOffers.filter(o => o.status === 'active').length})
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('inactive')}
                  >
                    Inactive ({allOffers.filter(o => o.status === 'inactive').length})
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('scheduled')}
                  >
                    Scheduled ({allOffers.filter(o => o.status === 'scheduled').length})
                  </button>
                </div>
              </div>

              <div className="offers-container">
                {loading ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p>Loading all offers...</p>
                  </div>
                ) : filteredAllOffers.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>No offers available across all branches</p>
                    <small>Check back later for new offers</small>
                  </div>
                ) : (
                  <div className="offers-grid">
                    {filteredAllOffers.map(offer => renderOfferCard(offer, true))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default OfferMaster;