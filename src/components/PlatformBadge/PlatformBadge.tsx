import type { Platform } from '../../types';
import { PLATFORM_MAP } from '../../types';
import styles from './PlatformBadge.module.css';

interface PlatformBadgeProps {
  platform: Platform;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = PLATFORM_MAP[platform] ?? { ...PLATFORM_MAP['default'], id: platform, name: platform };

  return (
    <span className={styles.badge} data-platform={platform}>
      <span className={styles.platformDot} />
      {config.name}
    </span>
  );
}
