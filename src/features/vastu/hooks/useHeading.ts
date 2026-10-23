import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

import { headingFromMagnetometer, normalizeDegrees, smoothHeading } from '../utils/heading';

/**
 * `fused`: the phone's own tilt-compensated compass (true north).
 * `magnetometer`: raw sensor, only correct with the phone held flat.
 */
export type HeadingSource = 'fused' | 'magnetometer';

type Result = {
  /** Smoothed heading in degrees, or `null` until the first reading. */
  heading: number | null;
  source: HeadingSource | null;
  /** 0 (uncalibrated) to 3 (high) for the fused source; `null` otherwise. */
  accuracy: number | null;
  /** `false` once we know there is no usable compass sensor. */
  available: boolean | null;
};

/**
 * Live compass heading. Prefers the operating system's fused heading (needs the
 * location permission, gives true north and works at any tilt) and falls back
 * to the raw magnetometer, corrected by `declination`, when that is unavailable.
 */
export function useHeading(enabled: boolean, declination: number): Result {
  const [raw, setRaw] = useState<number | null>(null);
  const [source, setSource] = useState<HeadingSource | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const smoothed = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let remove: (() => void) | undefined;

    const push = (degrees: number, alpha: number) => {
      smoothed.current = smoothHeading(smoothed.current, degrees, alpha);
      setRaw(smoothed.current);
    };

    const startMagnetometer = async () => {
      try {
        if (!(await Magnetometer.isAvailableAsync())) {
          if (!cancelled) setAvailable(false);
          return;
        }
        if (cancelled) return;
        setAvailable(true);
        setSource('magnetometer');
        setAccuracy(null);
        Magnetometer.setUpdateInterval(80);
        const sub = Magnetometer.addListener(({ x, y }) => push(headingFromMagnetometer(x, y), 0.2));
        remove = () => sub.remove();
      } catch {
        if (!cancelled) setAvailable(false);
      }
    };

    const start = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.granted) {
          const sub = await Location.watchHeadingAsync((h) => {
            // trueHeading is -1 when the OS cannot work it out; fall back to magnetic.
            const degrees = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
            setAccuracy(h.accuracy);
            push(degrees, 0.3);
          });
          if (cancelled) {
            sub.remove();
            return;
          }
          setAvailable(true);
          setSource('fused');
          remove = () => sub.remove();
          return;
        }
      } catch {
        /* fall through to the raw magnetometer */
      }
      await startMagnetometer();
    };

    void start();
    return () => {
      cancelled = true;
      remove?.();
      smoothed.current = null;
    };
  }, [enabled]);

  return {
    heading: raw === null ? null : source === 'magnetometer' ? normalizeDegrees(raw + declination) : normalizeDegrees(raw),
    source,
    accuracy,
    available,
  };
}
