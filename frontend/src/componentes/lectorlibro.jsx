import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Flipper, Flipped } from "react-flip-toolkit";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function LectorLibro({ url, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pageWidth, setPageWidth] = useState(500);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth;
        setPageWidth((availableWidth - 48) / 2);
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

  const nextPage = () => {
    if (isAnimating || pageNumber + 1 >= numPages) return;
    setIsAnimating(true);
    setPageNumber((prev) => Math.min(prev + 2, numPages - 1));
    setTimeout(() => setIsAnimating(false), 500); // un poco más lento para animación
  };

  const prevPage = () => {
    if (isAnimating || pageNumber <= 1) return;
    setIsAnimating(true);
    setPageNumber((prev) => Math.max(prev - 2, 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "1000px",
          height: "85%",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
          overflow: "hidden",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            border: "none",
            background: "transparent",
            fontSize: "24px",
            cursor: "pointer",
            color: "#444",
            zIndex: 2,
          }}
        >
          ✖
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            gap: "3rem",
            padding: "2rem 0",
          }}
        >
          <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
            <Flipper flipKey={pageNumber}>
              <div style={{ display: "flex", gap: "2rem" }}>
                <Flipped flipId={`page-${pageNumber}`}>
                  <div style={{ opacity: isAnimating ? 0.7 : 1, transition: "opacity 0.3s" }}>
                    <Page pageNumber={pageNumber} width={pageWidth} renderAnnotationLayer={false} />
                  </div>
                </Flipped>

                {pageNumber + 1 <= numPages && (
                  <Flipped flipId={`page-${pageNumber + 1}`}>
                    <div style={{ opacity: isAnimating ? 0.7 : 1, transition: "opacity 0.3s" }}>
                      <Page pageNumber={pageNumber + 1} width={pageWidth} renderAnnotationLayer={false} />
                    </div>
                  </Flipped>
                )}
              </div>
            </Flipper>
          </Document>
        </div>

        {numPages && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1 || isAnimating}
              style={{
                background: pageNumber <= 1 ? "#ccc" : "#7b5bf2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.4rem",
                cursor: pageNumber <= 1 ? "default" : "pointer",
                fontSize: "14px",
              }}
            >
              ⬅ Anterior
            </button>

            <span style={{ fontSize: "14px", color: "#555" }}>
              Página {pageNumber}–{Math.min(pageNumber + 1, numPages)} de {numPages}
            </span>

            <button
              onClick={nextPage}
              disabled={pageNumber + 1 >= numPages || isAnimating}
              style={{
                background: pageNumber + 1 >= numPages ? "#ccc" : "#7b5bf2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.4rem",
                cursor: pageNumber + 1 >= numPages ? "default" : "pointer",
                fontSize: "14px",
              }}
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
