"use client";

import { useState, useEffect } from "react";

export function useSafariDetection() {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsSafari(ua.includes("safari") && !ua.includes("chrome"));
  }, []);

  return isSafari;
}
