"use client";

/** A hand-drawn-feeling SVG pizza used as the hero centrepiece. */
export default function PizzaSVG({ className }: { className?: string }) {
  const pepperoni = [
    [160, 70],
    [225, 110],
    [240, 185],
    [195, 245],
    [120, 250],
    [80, 190],
    [95, 110],
    [160, 160],
  ];
  const basil = [
    [130, 120],
    [205, 160],
    [150, 215],
  ];

  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      role="img"
      aria-label="Wood-fired pizza"
    >
      <defs>
        <radialGradient id="crust" cx="50%" cy="45%" r="60%">
          <stop offset="55%" stopColor="#edb24a" />
          <stop offset="100%" stopColor="#b9712a" />
        </radialGradient>
        <radialGradient id="cheese" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="70%" stopColor="#ffce5c" />
          <stop offset="100%" stopColor="#f0a93c" />
        </radialGradient>
        <radialGradient id="sauce" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#e8552f" />
          <stop offset="100%" stopColor="#c0331b" />
        </radialGradient>
        <radialGradient id="pep" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#e0563b" />
          <stop offset="100%" stopColor="#a82318" />
        </radialGradient>
      </defs>

      {/* crust */}
      <circle cx="160" cy="160" r="150" fill="url(#crust)" />
      <circle
        cx="160"
        cy="160"
        r="150"
        fill="none"
        stroke="#8a4f1e"
        strokeWidth="3"
        opacity="0.5"
      />
      {/* charred spots on crust */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x = 160 + Math.cos(a) * 138;
        const y = 160 + Math.sin(a) * 138;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 2 ? 5 : 3}
            fill="#7a3f16"
            opacity="0.55"
          />
        );
      })}

      {/* sauce + cheese */}
      <circle cx="160" cy="160" r="126" fill="url(#sauce)" />
      <circle cx="160" cy="160" r="120" fill="url(#cheese)" />

      {/* cheese melt blobs */}
      {[
        [110, 130, 14],
        [210, 140, 12],
        [150, 200, 16],
        [200, 205, 10],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff0b8" opacity="0.55" />
      ))}

      {/* pepperoni */}
      {pepperoni.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="17" fill="url(#pep)" />
          <circle cx={x - 5} cy={y - 4} r="3" fill="#7c1c12" />
          <circle cx={x + 6} cy={y + 3} r="2.5" fill="#7c1c12" />
          <circle cx={x + 2} cy={y - 6} r="2" fill="#7c1c12" />
        </g>
      ))}

      {/* basil leaves */}
      {basil.map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="9"
          ry="5"
          fill="#3fa34d"
          transform={`rotate(${i * 40} ${x} ${y})`}
        />
      ))}
    </svg>
  );
}
