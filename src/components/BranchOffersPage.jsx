import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './BranchOffersPage.scss';

const API_BASE = 'http://192.168.1.45:8000/api';

// ── Icons ─────────────────────────────────────────────────────────────
const CalendarIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const ImagesIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Popup Modal ───────────────────────────────────────────────────────
function OfferModal({ offer, onClose }) {
  const images = offer.media_files?.filter(m => m.media_type === 'image') || [];
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef(null);

  // Sync idx as user scrolls
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const newIdx = Math.round(el.scrollTop / el.clientHeight);
    setIdx(newIdx);
  }, []);

  // Programmatic scroll
  const scrollTo = useCallback((i) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: i * scrollRef.current.clientHeight, behavior: 'smooth' });
    setIdx(i);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowUp')   scrollTo(Math.max(0, idx - 1));
      if (e.key === 'ArrowDown') scrollTo(Math.min(images.length - 1, idx + 1));
      if (e.key === 'Escape')    onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx, images.length, scrollTo, onClose]);

  const currentImage = images[idx] || null;

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try { await navigator.share({ title: offer.title, url: currentImage.file_url }); } catch (_) {}
    } else if (currentImage) {
      navigator.clipboard?.writeText(currentImage.file_url);
    }
  };

  return (
    <div className="bop-modal-overlay">

      {/* ── Top bar ── */}
      <div className="bop-modal-topbar">
        <span className="bop-modal-title">{offer.title}</span>
        {images.length > 1 && (
          <div className="bop-modal-dots-v">
            {images.map((_, i) => (
              <span key={i} className={i === idx ? 'active' : ''} onClick={() => scrollTo(i)} />
            ))}
          </div>
        )}
        <button className="bop-modal-close" onClick={onClose}>✕</button>
      </div>

      {/* ── Continuous vertical snap scroller — images ONLY, zero gaps ── */}
      <div
        className="bop-modal-scroll-feed"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {images.length === 0 ? (
          <div className="bop-feed-slide">
            <div className="bop-feed-empty">No image available</div>
          </div>
        ) : (
          images.map((img, i) => (
            <div className="bop-feed-slide" key={img.id}>
              <img src={img.file_url} alt={img.caption || offer.title} />
              {images.length > 1 && (
                <div className="bop-feed-counter">{i + 1} / {images.length}</div>
              )}
              {i === 0 && images.length > 1 && (
                <div className="bop-swipe-hint">
                  <span>↑</span> Swipe up for more
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Bottom panel: description + date + actions ── */}
      <div className="bop-modal-bottom-panel">
        {offer.description && (
          <p className="bop-bottom-desc">{offer.description}</p>
        )}
        <div className="bop-bottom-row">
          <div className="bop-bottom-validity">
            <CalendarIcon size={12} />
            {formatDate(offer.valid_from)} · {formatDate(offer.valid_to)}
          </div>
          <div className="bop-bottom-actions">
            <button className="bop-btn-share" onClick={handleShare}>
              <ShareIcon /> Share
            </button>
            {currentImage && (
              <a
                className="bop-btn-download"
                href={currentImage.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon /> Download
              </a>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
function BranchOffersPage() {
  const { branchId } = useParams();
  const [offers, setOffers]     = useState([]);
  const [branch, setBranch]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/public/branch/${branchId}/offers/`)
      .then(res => {
        setOffers(res.data.active_offers || []);
        setBranch(res.data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to load offers. Please try again.');
        setLoading(false);
      });
  }, [branchId]);

  if (loading) return (
    <div className="bop-loading">
      <div className="bop-spinner" />
      <p>Loading offers…</p>
    </div>
  );

  if (error) return (
    <div className="bop-error">
      <div className="bop-error-icon">⚠️</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="bop-page">

      {/* ── Header ── */}
      <header className="bop-header">
        {branch?.shop_name && (
          <div className="bop-shop-name">{branch.shop_name}</div>
        )}
        <h1 className="bop-branch-name">
          {branch?.branch_name || 'Branch Offers'}
        </h1>
        <div className="bop-branch-meta">
          {branch?.location       && <span><LocationIcon /> {branch.location}</span>}
          {branch?.contact_number && <span><PhoneIcon /> {branch.contact_number}</span>}
        </div>
      </header>

      {/* ── Section label ── */}
      <div className="bop-section-title">
        <h2>Flyer Offers</h2>
        <div className="bop-offer-count">
          {offers.length} {offers.length === 1 ? 'offer' : 'offers'} available
        </div>
      </div>

      {/* ── Grid / Empty ── */}
      {offers.length === 0 ? (
        <div className="bop-empty">
          <div className="bop-empty-icon">🎁</div>
          <p>No active offers right now</p>
          <small>Check back soon for exciting deals!</small>
        </div>
      ) : (
        <div className={`bop-grid ${offers.length === 1 ? 'single' : ''}`}>
          {offers.map(offer => {
            const images = offer.media_files?.filter(m => m.media_type === 'image') || [];
            const thumb  = images[0];

            return (
              <div
                className="bop-offer-card"
                key={offer.id}
                onClick={() => setSelected(offer)}
              >
                <div className="bop-card-thumb">
                  {thumb ? (
                    <img src={thumb.file_url} alt={offer.title} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#ede8df', color: '#aaa', fontSize: 12
                    }}>
                      No Image
                    </div>
                  )}
                  <div className="bop-thumb-validity">
                    <CalendarIcon />
                    Until {formatDate(offer.valid_to)}
                  </div>
                  {images.length > 1 && (
                    <div className="bop-img-count">
                      <ImagesIcon /> {images.length}
                    </div>
                  )}
                </div>
                <div className="bop-card-footer">
                  <div className="bop-card-title">{offer.title}</div>
                  {offer.description && (
                    <div className="bop-card-subdesc">{offer.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="bop-footer">
        <p>Powered by Vsaver</p>
      </div>

      {/* ── Popup Modal ── */}
      {selected && (
        <OfferModal offer={selected} onClose={() => setSelected(null)} />
      )}

    </div>
  );
}

export default BranchOffersPage;