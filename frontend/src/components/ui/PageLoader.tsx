import Loader from "./Loader";

interface PageLoaderProps {
  visible?: boolean;
}

const PageLoader = ({ visible = true }: PageLoaderProps) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "radial-gradient(circle at 50% -10%, rgba(196,48,43,0.16), rgba(11,13,16,0.94) 46%, rgba(7,9,12,0.98) 100%)",
      }}
      aria-hidden={!visible}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(196,48,43,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.22)_38%,rgba(0,0,0,0.48)_100%)]" />
      <Loader />
    </div>
  );
};

export default PageLoader;