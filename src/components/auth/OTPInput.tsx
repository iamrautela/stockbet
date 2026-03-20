import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

export const OTPInput = ({ value, onChange, disabled }: OTPInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (index: number, char: string) => {
    const next = [...value];
    next[index] = char;
    onChange(next);
    if (char && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        update(index, '');
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        update(index - 1, '');
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
    if (e.key === 'Enter') {
      // bubble up — parent handles submit
      refs.current[index]?.closest('form')?.requestSubmit();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    onChange(next);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          disabled={disabled}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, '').slice(-1);
            update(i, ch);
          }}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          className={`
            w-11 h-13 text-center text-xl font-bold rounded-xl border
            bg-muted text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            disabled:opacity-40 transition-all
            ${value[i] ? 'border-primary text-primary' : 'border-border'}
          `}
          style={{ height: '52px' }}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
};
