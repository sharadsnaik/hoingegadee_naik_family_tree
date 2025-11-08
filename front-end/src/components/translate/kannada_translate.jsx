import React from "react";

const KannadaToggle = () => {
  const translateToKannada = () => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = "kn"; // Kannada language code
      select.dispatchEvent(new Event("change"));
    } else {
      alert("Google Translate not loaded yet. Please wait a moment.");
    }
  };

  const resetToEnglish = () => {
    const iframe = document.querySelector(".goog-te-banner-frame");
    if (iframe) {
      const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      const restoreButton = innerDoc.querySelector(".goog-te-banner-content button");
      if (restoreButton) restoreButton.click();
    } else {
      window.location.reload(); // fallback
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <button
        onClick={translateToKannada}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        View in Kannada
      </button>

      <button
        onClick={resetToEnglish}
        style={{
          backgroundColor: "#f44336",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Back to English
      </button>
    </div>
  );
};

export default KannadaToggle;
