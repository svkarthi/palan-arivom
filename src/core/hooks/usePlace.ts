import { placeById } from '../astro/places';
import { useAppSelector } from '../store/hooks';

export function usePlace() {
  return placeById(useAppSelector((s) => s.profile.placeId));
}
