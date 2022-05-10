import { useState, useEffect } from "react";

const useDetectPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const handleBeforeprint = () => setIsPrinting(true);
  const handleAfterprint = () => setIsPrinting(false);

  useEffect(() => {
    window.addEventListener("beforeprint", handleBeforeprint);
    window.addEventListener("afterprint", handleAfterprint);
    // window.matchMedia('print').addEventListener('change', handleChange)
    return () => {
      window.removeEventListener("beforeprint", handleBeforeprint);
      window.removeEventListener("afterprint", handleAfterprint);
      // window.matchMedia('print').removeEventListener('change', handleChange)
    };
  });

  return isPrinting;
};

export default useDetectPrint;
