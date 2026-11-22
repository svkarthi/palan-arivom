import type { NavigatorScreenParams } from '@react-navigation/native';

import type { PadhigamStackParamList } from '../../features/padhigam/navigation/types';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Vastu: undefined;
  NallaNeram: undefined;
  NallaNaal: undefined;
  Porutham: undefined;
  BirthStar: undefined;
  Padhigam: NavigatorScreenParams<PadhigamStackParamList> | undefined;
};
