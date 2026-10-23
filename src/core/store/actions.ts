import { createAction } from '@reduxjs/toolkit';

/** Resets every slice to its initial state. */
export const resetAll = createAction('app/resetAll');
