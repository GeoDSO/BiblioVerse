import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./lectorlibro.css";
import { gsap } from "gsap";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 💡 Worker correcto
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function LectorLibro({ url, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(400);
  const containerRef = useRef(null);
  const bookRef = useRef(null);

  // Ajuste de tamaño dinámico
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth;
        setPageWidth(Math.min(availableWidth / 2 - 50, 550)); // páginas más grandes
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
    });
    tl.set(bookRef.current, { x: -xDir });
    tl.to(bookRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.25,
      ease: "power2.out",
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

        <div className="pages-container">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => alert("Error al cargar PDF: " + err.message)}
          >
            {numPages && (
              <div ref={bookRef} className="book-pages">
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