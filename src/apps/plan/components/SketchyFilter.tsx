/**
 * Hand-drawn border SVG filter — Excalidraw-style (subtle wobble, not distortion).
 */
const SketchyFilter = () => (
  <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
    <defs>
      {/* Subtle wobble for task bars */}
      <filter id="sketchy" x="-3%" y="-8%" width="106%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* Slightly stronger for decorative SVG paths */}
      <filter id="sketchy-strong" x="-3%" y="-8%" width="106%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

export default SketchyFilter;
