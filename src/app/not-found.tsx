import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-3)",
        padding: "var(--space-5)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(80px, 14vw, 200px)",
          lineHeight: 0.9,
          letterSpacing: "0.04em",
          color: "var(--color-flare)",
          textTransform: "uppercase",
        }}
      >
        404
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        This film does not exist.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: "var(--color-mercury)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          maxWidth: 480,
        }}
      >
        The reel has run out. The frame you&apos;re looking for has been cut from the print.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
        Return to the lobby
      </Link>
    </main>
  );
}
