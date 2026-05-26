import React from "react";

function AppFooter({ onShowIntro }) {
  return (
    <footer className="app-footer">
      <span>Follow-up Automation by Arnav</span>

      <button className="footer-link-btn" onClick={onShowIntro}>
        Show Intro
      </button>

      <span className="footer-tag">Add-in channel</span>
    </footer>
  );
}

export default AppFooter;
