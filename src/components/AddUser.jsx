// import React, { useState } from "react";

// const AddUser = ({ onBack, onUserAdded }) => {
//   const [formData, setFormData] = useState({
//     customer_name: "",
//     shop_name: "",
//     username: "",
//     email: "",
//     password: "",
//     phone_number: "",
//     amount: "",
//     location: "",
//     status: "Active",
//     no_days: 90,
//     validity_start: "",
//     validity_end: ""
//   });

//   const [loading, setLoading] = useState(false);

//   const colors = {
//     primary: "#00897b",
//     dark: "#00695c",
//     bg: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
//     white: "#ffffff",
//     border: "#b2dfdb"
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     setLoading(true);

//     const token = localStorage.getItem("access_token");

//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/admins/", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(formData)
//       });

//       if (response.ok) {
//         alert("✅ User Created Successfully!");
//         onUserAdded();
//         onBack();
//       } else {
//         const err = await response.json();
//         alert(JSON.stringify(err));
//       }
//     } catch {
//       alert("❌ Server error");
//     }

//     setLoading(false);
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: colors.bg,
//         padding: 40
//       }}
//     >
//       <button
//         onClick={onBack}
//         style={{
//           background: "#f5f5f5",
//           border: `2px solid ${colors.border}`,
//           borderRadius: 10,
//           padding: "8px 16px",
//           fontWeight: 700,
//           cursor: "pointer",
//           marginBottom: 25
//         }}
//       >
//         ⬅ Back
//       </button>

//       <div
//         style={{
//           background: colors.white,
//           maxWidth: 900,
//           margin: "auto",
//           padding: 35,
//           borderRadius: 22,
//           border: `3px solid ${colors.border}`,
//           boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
//         }}
//       >
//         <h2
//           style={{
//             color: colors.primary,
//             textAlign: "center",
//             marginBottom: 30,
//             fontWeight: 800
//           }}
//         >
//           ➕ Add New User
//         </h2>

//         <div>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr",
//               gap: 20
//             }}
//           >
//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Customer Name
//               </label>
//               <input
//                 type="text"
//                 name="customer_name"
//                 value={formData.customer_name}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Shop Name
//               </label>
//               <input
//                 type="text"
//                 name="shop_name"
//                 value={formData.shop_name}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Username
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Password
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Phone Number
//               </label>
//               <input
//                 type="number"
//                 name="phone_number"
//                 value={formData.phone_number}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="amount"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Location
//               </label>
//               <input
//                 type="text"
//                 name="location"
//                 value={formData.location}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Status
//               </label>
//               <select
//                 name="status"
//                 value={formData.status}
//                 onChange={handleChange}
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   cursor: "pointer",
//                   boxSizing: "border-box"
//                 }}
//               >
//                 <option value="Active">Active</option>
//                 <option value="Disable">Disable</option>
//               </select>
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 No. of Days
//               </label>
//               <input
//                 type="number"
//                 name="no_days"
//                 value={formData.no_days}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Validity Start
//               </label>
//               <input
//                 type="date"
//                 name="validity_start"
//                 value={formData.validity_start}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>

//             <div>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 6,
//                   color: colors.dark,
//                   fontWeight: 700,
//                   fontSize: 13
//                 }}
//               >
//                 Validity End
//               </label>
//               <input
//                 type="date"
//                 name="validity_end"
//                 value={formData.validity_end}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   borderRadius: 12,
//                   border: `2px solid ${colors.border}`,
//                   fontSize: 14,
//                   outline: "none",
//                   boxSizing: "border-box"
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = colors.primary)}
//                 onBlur={(e) => (e.target.style.borderColor = colors.border)}
//               />
//             </div>
//           </div>

//           <div style={{ textAlign: "center", marginTop: 35 }}>
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               style={{
//                 background: colors.primary,
//                 color: "#fff",
//                 padding: "15px 42px",
//                 borderRadius: 16,
//                 border: "none",
//                 fontWeight: 800,
//                 fontSize: 16,
//                 cursor: "pointer",
//                 boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
//               }}
//             >
//               {loading ? "Creating..." : "✅ Create User"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddUser;