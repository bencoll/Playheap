import type { Platform } from '../../types';
import { PLATFORMS } from '../../types';
import styles from './PlatformBadge.module.css';

interface PlatformBadgeProps {
  platform: Platform;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = PLATFORMS.find((p) => p.id === platform);
  if (!config) return null;

  return (
    <span className={styles.badge} data-platform={platform}>
      <span className={styles.platformDot} />
      {config.name}
    </span>
  );
}
