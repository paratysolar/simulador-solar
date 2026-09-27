import { PHOTO_DATA_A1 } from './photo-data-a1';
import { PHOTO_DATA_A2 } from './photo-data-a2';
import { PHOTO_DATA_A3 } from './photo-data-a';
import { PHOTO_DATA_B1 } from './photo-data-b1';
import { PHOTO_DATA_B2 } from './photo-data-b2';
import { PHOTO_DATA_B3 } from './photo-data-b';
import { PHOTO_DATA_C1 } from './photo-data-c1';

export const REAL_PHOTOS = {
  cover1: PHOTO_DATA_A1,
  cover2: PHOTO_DATA_A2,
  cover3: PHOTO_DATA_A3,
  portfolio: [...PHOTO_DATA_B1, ...PHOTO_DATA_B2, ...PHOTO_DATA_B3],
  team: PHOTO_DATA_C1,
};
