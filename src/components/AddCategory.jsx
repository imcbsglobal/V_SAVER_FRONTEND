// src/components/AddCategory.jsx
import React, { useState } from "react";
import { Box, TextField, Button, Card, Typography } from "@mui/material";
import api from "../services/api";

export default function AddCategory() {

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  async function submit(e) {
    e.preventDefault();

    if (!name) return alert("Please enter category name");

    try {
      const fd = new FormData();
      fd.append("name", name);
      if (file) fd.append("image", file);

      // FIXED URL  (previously wrong)
      await api.post("user/categories/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Category added successfully!");
      window.location.href = "/user-dashboard";

    } catch (err) {
      alert("Failed to add category");
      console.log(err);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add New Category
      </Typography>

      <Card className="card" sx={{ p: 3 }}>
        <form onSubmit={submit}>
          <TextField
            label="Category Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ margin: "20px 0" }} />

          <Button
            variant="contained"
            type="submit"
            sx={{ background: "#2fa573" }}
          >
            ADD CATEGORY
          </Button>
        </form>
      </Card>
    </Box>
  );
}
