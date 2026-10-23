import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

import { headingFromMagnetometer, normalizeDegrees, smoothHeading } from '../utils/heading';

type Result = {
  /** Smoothed heading in degrees, or `null` until the first reading. */
  heading: number | null;
  /** `null` while checking, then whether a magnetometer exists. */
  available: boolean | null;
};

/** Live compass heading from the magnetometer, corrected by `declination`. */
export function useHeading(enabled: boolean, declination: number): Result {
  const [raw, setRaw] = useState<number | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const smoothed = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let subscription: { remove: () => void } | undefined;

    Magnetometer.isAvailableAsync()
      .then((ok) => {
        if (cancelled) return;
        setAvailable(ok);
        if (!ok) return;
        Magnetometer.setUpdateInterval(80);
        subscription = Magnetometer.addListener(({ x, y }) => {
          smoothed.current = smoothHeading(smoothed.current, headingFromMagnetometer(x, y));
          setRaw(smoothed.current);
        });
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return {
    heading: raw === null ? null : normalizeDegrees(raw + declination),
    available,
  };
}
