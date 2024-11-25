"use client";
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const PrintableComponent = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <h1>{props.title}</h1>
    <p>Additional content to print.</p>
  </div>
));

const App = () => {
  const [title, setTitle] = useState("Initial Title");
  const [isPrinting, setIsPrinting] = useState(false); // State to track printing status
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "My Document",
    onBeforePrint: async () => {
      try {
        // Assume fetchSomeData is an async function returning a promise
        const data = await fetchSomeData();
        console.log("Data fetched before print:", data);
      } catch (error) {
        console.error("Error fetching data before print:", error);
      }
    },
    onAfterPrint: () => {
      console.log("Print process complete.");
    },
  });

  return (
    <div>
      <button onClick={handlePrint} disabled={isPrinting}>
        Print
      </button>
      <PrintableComponent ref={componentRef} title={title} />
      {isPrinting && <p>Printing...</p>} {/* Display message while printing */}
    </div>
  );
};

export default App;
