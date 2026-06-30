import { memo } from 'react';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

// A soft contact shadow: a flat ellipse filled with a radial gradient that is darkest at the
// center and fades to fully transparent at the rim — so an object reads as GROUNDED on the meadow
// without the hard-edged "bar" a solid-color View produces. cx/cy/rx/ry are in px (scene coords).
// Decorative + a11y-hidden + non-interactive, like the rest of the scene layers.
export const ContactShadow = memo(function ContactShadow({
  cx,
  cy,
  rx,
  ry,
  color = '#2e2012',
  opacity = 0.4,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color?: string;
  opacity?: number;
}) {
  const w = rx * 2;
  const h = ry * 2;
  return (
    <Svg
      width={w}
      height={h}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left: cx - rx, top: cy - ry }}
    >
      <Defs>
        <RadialGradient id="contactShadowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="55%" stopColor={color} stopOpacity={opacity * 0.55} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill="url(#contactShadowGrad)" />
    </Svg>
  );
});
