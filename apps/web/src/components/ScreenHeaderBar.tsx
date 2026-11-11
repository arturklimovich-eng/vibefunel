import Image from 'next/image';
import type { FunnelDefinition, Screen } from '@funnel/schema';
import { isHttpsUrl } from '@funnel/schema';
import { DEFAULT_SEGMENTS, progressFills } from '@funnel/schema';
import { screenSurface } from '@/lib/styles';
import type { StepPosition } from '@funnel/schema';
import styles from './ScreenHeaderBar.module.css';

interface ScreenHeaderBarProps {
  definition: FunnelDefinition;
  screen: Screen;
  position: StepPosition;
  canGoBack: boolean;
  onBack?: () => void;
}

export function ScreenHeaderBar({
  definition,
  screen,
  position,
  canGoBack,
  onBack,
}: ScreenHeaderBarProps) {
  const header = screen.header ?? {};
  const showBack = header.backButton ?? true;
  const showCounter = header.counter ?? true;
  const showProgress = header.progress ?? true;
  const fills = showProgress
    ? progressFills(
        definition,
        screen,
        position,
        header.progressType ?? 'line',
        header.segments ?? DEFAULT_SEGMENTS,
      )
    : [];
  const logo =
    (header.showLogo ?? false) && isHttpsUrl(definition.theme.logoUrl)
      ? definition.theme.logoUrl
      : null;
  const image = isHttpsUrl(header.imageUrl) ? header.imageUrl : null;
  const imageRight = header.imagePosition === 'right';
  const title = header.title?.trim() ?? '';
  const label = `Step ${position.step} of up to ${position.total}`;

  if (!showBack && !showCounter && fills.length === 0 && !logo && !image && title === '') {
    return null;
  }

  const imageEl = image ? (
    <Image
      className={styles.image}
      src={image}
      alt={header.imageAlt ?? ''}
      width={64}
      height={64}
      unoptimized
    />
  ) : null;

  return (
    <div className={styles.bar} style={screenSurface(screen, definition.theme).header}>
      {fills.length > 0 ? (
        <div
          className={styles.progress}
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={position.total}
          aria-valuenow={position.step}
        >
          {fills.map((fill, i) => (
            <span key={i} className={styles.track}>
              <span className={styles.fill} style={{ width: `${Math.round(fill * 100)}%` }} />
            </span>
          ))}
        </div>
      ) : null}
      <div className={styles.row}>
        <span className={styles.side}>
          {showBack ? (
            <button
              type="button"
              className={styles.back}
              onClick={onBack}
              disabled={!canGoBack}
              aria-label="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 5l-7 7 7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </span>
        <span className={styles.center}>
          {logo ? (
            <Image className={styles.logo} src={logo} alt="" width={224} height={56} unoptimized />
          ) : null}
          {imageRight ? null : imageEl}
          {title !== '' ? <span className={styles.title}>{title}</span> : null}
          {imageRight ? imageEl : null}
        </span>
        <span className={styles.side} data-align="end">
          {showCounter ? (
            <span className={styles.counter}>
              {position.step}/{position.total}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
