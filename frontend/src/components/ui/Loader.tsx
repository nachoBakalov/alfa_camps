const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-5">
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
        <div
          className="absolute h-full w-full rounded-full border border-[color-mix(in_srgb,var(--public-primary)_76%,#fff_24%)]"
          style={{
            boxShadow: '0 0 0 1px rgba(196, 48, 43, 0.24), 0 0 26px rgba(196, 48, 43, 0.38)',
            animation: 'alfaSpin 2.9s linear infinite',
          }}
        />

        <div
          className="absolute h-[72%] w-[72%] rounded-full border border-[color-mix(in_srgb,var(--public-border)_56%,transparent)]"
          style={{ animation: 'alfaSpinReverse 2.3s linear infinite' }}
        />

        <div
          className="relative flex h-[54%] w-[54%] items-center justify-center overflow-hidden rounded-[0.9rem] border border-[color-mix(in_srgb,var(--public-border)_28%,transparent)] bg-[linear-gradient(160deg,#1f2530_0%,#14181f_100%)]"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 12px 26px rgba(0,0,0,0.42)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 28%, rgba(196,48,43,0.68) 0%, rgba(196,48,43,0.44) 56%, rgba(196,48,43,0.24) 100%)',
            }}
          />

          <img
            src="/logo.png"
            alt="ALFA Camp"
            className="relative z-10 h-[70%] w-[70%] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ animation: 'alfaPulse 1.9s ease-in-out infinite' }}
        />
      </div>

      <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--public-text-muted)_88%,#fff_12%)] sm:text-sm">
        Подготвяме лагера...
      </p>
    </div>
  );
};

export default Loader;