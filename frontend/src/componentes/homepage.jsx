import React, { useState } from "react";
import LectorLibro from "./lectorlibro.jsx";
import "./homepage.css";

function HomePage() {
  // 👉 Estado para saber qué libro se está leyendo
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  // 👉 Lista de libros recomendados
  const librosRecomendados = [
    {
      titulo: "Orgullo y Prejuicio",
      autor: "Jane Austen",
      portada: "/imagenes/orgulloyprejuicio.jpg",
      archivo: "/libros/orgullo_y_prejuicio.pdf",
    },
    {
      titulo: "El Principito",
      autor: "Antoine de Saint-Exupéry",
      portada: "/imagenes/elprincipito.jpg",
      archivo: "/libros/El-Principitocompleto.pdf",
    },
    {
      titulo: "Emma",
      autor: "Jane Austen",
      portada: "/imagenes/emma.jpg",
      archivo: "/libros/emma.pdf",
    },
    {
      titulo: "El retrato de Dorian Gray",
      autor: "Oscar Wilde",
      portada: "/imagenes/elretrato.jpg",
      archivo: "/libros/ElRetrato.pdf",
    },
    {
      titulo: "Crepúsculo",
      autor: "Stephenie Meyer",
      portada: "/imagenes/crepusculo.jpg",
      archivo: "/libros/crepusculo.pdf",
    },
    {
      titulo: "Alicia en el país de las maravillas",
      autor: "Lewis Carroll",
      portada: "/imagenes/alicia.jpg",
      archivo: "/libros/alicia.pdf",
    },
  ];

  return (
    <div className="homepage-container">
      <h1>✨ Libros Recomendados ✨</h1>

      {/* 📚 Cuadrícula de libros */}
      <div className="libros-grid">
        {librosRecomendados.map((libro, index) => (
          <div
            key={index}
            className="libro-card"
            onClick={() => setLibroSeleccionado(libro)}
          >
            <img src={libro.portada} alt={libro.titulo} />
            <h3>{libro.titulo}</h3>
            <p>{libro.autor}</p>
          </div>
        ))}
      </div>

      {/* 📖 Modal lector de libros */}
      {libroSeleccionado && (
        <LectorLibro
          url={libroSeleccionado.archivo}
          onClose={() => setLibroSeleccionado(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
