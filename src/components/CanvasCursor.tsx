import useCanvasCursor from "@/hooks/useCanvasCursor";

const CanvasCursor = () => {
  useCanvasCursor();

  return (
    <canvas
      id="canvas"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
};

export default CanvasCursor;
