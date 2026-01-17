import React, { useState } from "react";
import API from "../services/api";

export default function AddProduct({ onCreated }) {
  const [form, setForm] = useState({
    product_name: "",
    original_price: "",
    offer_price: "",
    brand: "",
    category: "",
    valid_until: "",
    template_type: "template1",
  });

  const [image, setImage] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    if (image) data.append("image", image);

    const res = await API.post("products/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    onCreated(res.data.id);
  }

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded">
      <h2 className="font-bold">Add Product</h2>

      <input
        name="product_name"
        placeholder="Product Name"
        onChange={handleChange}
        className="border p-2 w-full mt-2"
      />

      <input
        name="original_price"
        placeholder="Original Price"
        onChange={handleChange}
        className="border p-2 w-full mt-2"
      />

      <input
        name="offer_price"
        placeholder="Offer Price"
        onChange={handleChange}
        className="border p-2 w-full mt-2"
      />

      <input
        name="brand"
        placeholder="Brand"
        onChange={handleChange}
        className="border p-2 w-full mt-2"
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        className="border p-2 w-full mt-2"
      />

      <button
        type="submit"
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Add Product
      </button>
    </form>
  );
}
