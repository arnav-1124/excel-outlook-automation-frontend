import React from "react";

function Banner({ banner, onClose }) {
  if (!banner) return null;

  return (
    <div className="banner-container">
      <div className={`banner banner-${banner.type}`}>
        <span className="banner-icon">
          {banner.type === "success" && "✓"}
          {banner.type === "error" && "!"}
          {banner.type === "warning" && "⚠"}
          {banner.type === "info" && "i"}
        </span>

        <span className="banner-message">{banner.message}</span>

        <button className="banner-dismiss" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default Banner;
