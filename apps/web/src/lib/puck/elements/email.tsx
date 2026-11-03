'use client';

import { useId, useState } from 'react';
import { emailInputProps, emailKey, isValidEmail } from '@/lib/email';
import { boxStyle, textStyle } from '@/lib/styles';
import type { BlockProps } from '../frame';
import { useRuntime } from '../runtime-context';
import styles from '../blocks.module.css';

export function EmailInputBlock(props: BlockProps) {
  const runtime = useRuntime();
  const parsed = emailInputProps.safeParse(props);
  const [touched, setTouched] = useState(false);
  const inputId = useId();
  if (!parsed.success || typeof props.id !== 'string') {
    return (
      <p className={styles.placeholder} role="alert">
        Invalid email block: its settings could not be read, so this screen cannot continue.
      </p>
    );
  }
  const { label, placeholder, required, consentLabel } = parsed.data;
  const screenId = runtime.screenId;
  const key = screenId === null ? null : emailKey(screenId, props.id);
  const value = key === null ? '' : (runtime.emails[key] ?? '');
  const consented = key === null ? false : runtime.consents[key] === true;
  const invalid = touched && value.trim().length > 0 && !isValidEmail(value);
  const missing = touched && required && value.trim().length === 0;
  const errorId = `${inputId}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.fieldLabel} style={textStyle(props.blockStyle)}>
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={inputId}
        type="email"
        autoComplete="email"
        inputMode="email"
        className={styles.input}
        style={boxStyle({
          background: props.blockStyle.background,
          borderColor: props.blockStyle.borderColor,
          borderWidth: props.blockStyle.borderWidth,
          radius: props.blockStyle.radius,
        })}
        placeholder={placeholder}
        value={value}
        required={required}
        maxLength={254}
        aria-invalid={invalid || missing}
        aria-describedby={invalid || missing ? errorId : undefined}
        onChange={(event) => {
          if (key !== null) runtime.setEmail(key, event.target.value);
        }}
        onBlur={() => setTouched(true)}
      />
      {invalid || missing ? (
        <p id={errorId} className={styles.fieldError}>
          {invalid ? 'Enter a valid email address.' : 'This field is required.'}
        </p>
      ) : null}
      {consentLabel.trim().length > 0 ? (
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={consented}
            onChange={(event) => {
              if (key !== null) runtime.setConsent(key, event.target.checked);
            }}
          />
          <span>{consentLabel}</span>
        </label>
      ) : null}
    </div>
  );
}
