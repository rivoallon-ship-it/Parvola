import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Input } from './Input';
import { formatDate } from '@/utils/helpers';

interface SignaturePadProps {
  /** Existing signature as a PNG data URL (read-only display when set & locked). */
  value?: string;
  /** Typed name of the signatory. */
  name?: string;
  /** Date (ISO) the signature was recorded, shown in read-only mode. */
  signedAt?: string;
  /** Disable drawing (campaign closed, not the right user, etc.). */
  disabled?: boolean;
  /** Called once the user validates a freshly drawn signature. */
  onSign?: (dataUrl: string, name: string) => void;
}

/**
 * Handwritten signature capture on an HTML5 canvas (mouse + touch via
 * Pointer Events). No external dependency. Exports the drawing as a PNG
 * data URL. When `value` is already set, renders the stored signature
 * read-only instead of the drawing surface.
 */
export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  name,
  signedAt,
  disabled = false,
  onSign,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const [empty, setEmpty] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Already signed → read-only display.
  const signed = !!value;

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  useEffect(() => {
    if (signed || disabled) return;
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    // Scale for crisp lines on high-DPI screens.
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
  }, [signed, disabled, getCtx]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || signed) return;
    drawing.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStroke.current = true;
    if (empty) setEmpty(false);
  };

  const handlePointerUp = () => {
    drawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    setEmpty(true);
  };

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const nameComplete = !!firstName.trim() && !!lastName.trim();

  const handleValidate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke.current || !nameComplete) return;
    onSign?.(canvas.toDataURL('image/png'), fullName);
  };

  if (signed) {
    return (
      <div className="space-y-2">
        <img
          src={value}
          alt={t('signature.altSigned')}
          className="h-24 w-full object-contain rounded-lg border border-gray-200 bg-white"
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium text-gray-700">{name}</span>
          {signedAt && <span>{t('signature.signedOn')} {formatDate(signedAt)}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t('signature.firstNamePlaceholder')}
          disabled={disabled}
        />
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t('signature.lastNamePlaceholder')}
          disabled={disabled}
        />
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-32 w-full rounded-lg border border-dashed border-gray-300 bg-white touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300">
            {t('signature.drawHint')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleClear} disabled={disabled || empty}>
          <Eraser size={14} className="mr-1" />
          {t('signature.clear')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleValidate}
          disabled={disabled || empty || !nameComplete}
        >
          <Check size={14} className="mr-1" />
          {t('signature.validate')}
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
