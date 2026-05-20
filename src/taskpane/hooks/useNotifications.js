import { useState } from "react";

function useNotifications() {
  const [banner, setBanner] = useState(null);
  const [toast, setToast] = useState(null);

  function showBanner(type, message) {
    setBanner({ type, message });

    if (type !== "error") {
      setTimeout(() => {
        setBanner(null);
      }, 3500);
    }
  }

  function showToast(type, title, message) {
    setToast({ type, title, message });

    setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  function clearBanner() {
    setBanner(null);
  }

  function clearToast() {
    setToast(null);
  }

  return {
    banner,
    toast,
    showBanner,
    showToast,
    clearBanner,
    clearToast,
  };
}

export default useNotifications;