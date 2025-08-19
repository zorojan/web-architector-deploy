/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RefObject, useEffect, useState } from 'react';
import { renderBasicFaceWidget } from './basic-face-render-widget';
import useFaceWidget from '../../../hooks/demo/use-face-widget';

type BasicFaceWidgetProps = {
  /** The canvas element on which to render the face. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** The radius of the face. */
  radius?: number;
  /** The color of the face. */
  color?: string;
  /** Whether the face should be in an "active" state. */
  isActive?: boolean;
};

export default function BasicFaceWidget({
  canvasRef,
  radius = 60,
  color = '#007bff',
  isActive = false,
}: BasicFaceWidgetProps) {
  const { eyeScale, mouthScale } = useFaceWidget();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function calculateScale() {
      // Keep it simple for widget
      setScale(1);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Render the face on the canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    renderBasicFaceWidget({
      ctx,
      mouthScale,
      eyeScale,
      color,
    });
  }, [canvasRef, mouthScale, eyeScale, color, scale]);

  return (
    <canvas
      className="basic-face-widget"
      ref={canvasRef}
      width={radius * 2}
      height={radius * 2}
      style={{
        display: 'block',
        borderRadius: '50%',
        transition: 'transform 0.2s ease',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
      }}
    />
  );
}
