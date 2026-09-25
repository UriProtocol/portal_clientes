import clsx from "clsx";

type LoadingAppProps = {
  gradientBg?: boolean;
  message?: string;
};

export default function LoadingApp({ gradientBg = false, message = "Cargando" }: LoadingAppProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden",
        gradientBg ? "loading-app__bg" : "bg-datia-primary/5"
      )}
    >
      {/* Floating brand-colored blobs */}
      <div aria-hidden className="loading-app__blob loading-app__blob--primary" />
      <div aria-hidden className="loading-app__blob loading-app__blob--secondary" />

      <div className="relative flex h-60 w-60 items-center justify-center">
        {/* Pulsing halos */}
        <span aria-hidden className="loading-app__halo" />
        <span aria-hidden className="loading-app__halo loading-app__halo--delayed" />

        {/* Spinning gradient ring */}
        <span aria-hidden className="loading-app__ring" />

        {/* Logo */}
        <div className="loading-app__logo relative z-10 flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Proveedora de Llantas" className="h-32 w-32 object-contain" />
        </div>
      </div>

    </div>
  );
}
