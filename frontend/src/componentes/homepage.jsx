import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import LectorLibro from "./lectorlibro.jsx";
import "./homepage.css";

function HomePage() {
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const principitoRef = useRef(null);

useEffect(() => { 
  if (principitoRef.current) {
    gsap.to(principitoRef.current, {
      y: -35,
      rotation: 10,
      duration: 6, 
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      transformOrigin: "center center", 
    });
  }
}, []);

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

  const handleLibroClick = (libro) => {
    setLibroSeleccionado(libro);
  };

  return (
    <div className="page-wrapper day">
      <div className="page-content">
    <div className="homepage-container">
      <header className="header-libros">
        <img
          ref={principitoRef}
          src="/imagenes/elprincipito.png"
          alt="El Principito"
          className="principito"
        />
        <div className="header-texto">
          <h1>
            NUESTROS <span>RECOMENDADOS</span>
          </h1>
          <p>Descubre nuestros libros más encantadores del momento</p>
        </div>
      </header>

      <div className="estanteria">
        <div className="libros-grid">
          {librosRecomendados.map((libro, index) => (
            <div
              key={index}
              className="libro-card"
              onClick={() => handleLibroClick(libro)}
            >
              <img src={libro.portada} alt={libro.titulo} />
              <h3>{libro.titulo}</h3>
              <p>{libro.autor}</p>
            </div>
          ))}
        </div>
        <div className="boton-descubrir">DESCUBRE MÁS</div>
      </div>

      {libroSeleccionado && (
        <LectorLibro
          url={libroSeleccionado.archivo}
          onClose={() => setLibroSeleccionado(null)}
        />
      )}
    </div>
      </div>
    </div>
  );
}

export default HomePage;
