import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./lectorlibro.css";
import { gsap } from "gsap";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function LectorLibro({ url, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(400);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const bookRef = useRef(null);

  // Ajuste de tamaño dinámico
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth;
        setPageWidth(Math.min(availableWidth / 2 - 50, 550));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const animarCambio = (direccion) => {
    if (!bookRef.current) return;
    const tl = gsap.timeline();
    const xDir = direccion === "next" ? -40 : 40;
    tl.to(bookRef.current, {
      opacity: 0,
      x: xDir,
      duration: 0.2,
      ease: "power1.out",
      scale: scale, // Mantener el scale actual
    });
    tl.set(bookRef.current, { x: -xDir, scale: scale });
    tl.to(bookRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.25,
      ease: "power2.out",
      scale: scale, // Mantener el scale actual
    });
  };

  const nextPage = () => {
    if (pageNumber + 2 <= numPages) {
      animarCambio("next");
      setTimeout(() => setPageNumber(pageNumber + 2), 200);
    }
  };

  const prevPage = () => {
    if (pageNumber - 2 >= 1) {
      animarCambio("prev");
      setTimeout(() => setPageNumber(pageNumber - 2), 200);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };

  const resetZoom = () => {
    setScale(1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        {/* Controles de zoom */}
        <div className="zoom-controls">
          <button 
            className="zoom-btn" 
            onClick={zoomOut}
            disabled={scale <= 0.6}
            title="Reducir zoom"
          >
            🔍-
          </button>
          
          <span className="zoom-indicator">
            {Math.round(scale * 100)}%
          </span>
          
          <button 
            className="zoom-btn" 
            onClick={zoomIn}
            disabled={scale >= 2.5}
            title="Aumentar zoom"
          >
            🔍+
          </button>
          
          <button 
            className="zoom-btn reset-btn" 
            onClick={resetZoom}
            title="Restablecer zoom"
          >
            ↻
          </button>
        </div>

        <div className="pages-container">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => alert("Error al cargar PDF: " + err.message)}
          >
            {numPages && (
              <div 
                ref={bookRef} 
                className="book-pages"
                style={{ transform: `scale(${scale})` }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
                {pageNumber + 1 <= numPages && (
                  <Page
                    pageNumber={pageNumber + 1}
                    width={pageWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                )}
              </div>
            )}
          </Document>
        </div>

        {numPages && (
          <div className="controls">
            <button
              className="btn"
              onClick={prevPage}
              disabled={pageNumber <= 1}
            >
              ⬅ Anterior
            </button>

            <span className="page-counter">
              Página {pageNumber}–{Math.min(pageNumber + 1, numPages)} de{" "}
              {numPages}
            </span>

            <button
              className="btn"
              onClick={nextPage}
              disabled={pageNumber + 1 >= numPages}
            >
              Siguiente ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LectorLibro;