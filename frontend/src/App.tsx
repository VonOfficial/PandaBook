import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { BookDetailPage } from "./pages/BookDetailPage";

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <BrowserRouter>
      <div className="app">
        <Header search={search} onSearchChange={setSearch} />

        <Routes>
          <Route path="/" element={<HomePage search={search} />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}