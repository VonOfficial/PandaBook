import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import { CartProvider } from "./context/CartContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { CartPage } from "./pages/CartPage";

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app">
          <Header search={search} onSearchChange={setSearch} />

          <Routes>
            <Route path="/" element={<HomePage search={search} />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>

          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}