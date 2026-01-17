import CategoryStrip from "./CategoryStrip";

export default function Navbar({ onLogout }) {
  return (
    <>
      {/* ✅ FIXED NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.container}>
          <h1 style={styles.logo}>OfferLink</h1>

          <div style={styles.actions}>
            <button style={styles.greenBtn}>Select Category</button>
            <button style={styles.greenBtn}>Add Product</button>
            <button style={styles.darkBtn}>Templates</button>
            <button style={styles.logoutBtn} onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ CATEGORY STRIP MUST BE AFTER NAVBAR */}
      <div style={{ marginTop: "90px" }}>
        <CategoryStrip />
      </div>
    </>
  );
}

const styles = {
  nav: {
    width: "100%",
    background: "#ffffff",
    padding: "16px 32px",
    position: "fixed",
    top: 0,
    zIndex: 1000,
    borderBottom: "2px solid #22c55e",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#16a34a",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  greenBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "8px 18px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  darkBtn: {
    background: "#166534",
    color: "white",
    border: "none",
    padding: "8px 18px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 18px",
    borderRadius: "999px",
    fontWeight: "600",
  },
};
