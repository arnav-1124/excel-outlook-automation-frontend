import React from "react";

function AppFooter({ onShowIntro }) {
  return (
    <footer className="app-footer">
      <span>Excel Email Automation by Arnav</span>

      <button className="footer-link-btn" onClick={onShowIntro}>
        Show Intro
      </button>

      <span className="footer-tag">Local MVP</span>
    </footer>
  );
}

export default AppFooter;
