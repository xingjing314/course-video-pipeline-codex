export const FPS = 30;

export const G03_INTRO_SECONDS = 2;
export const G03_ROW_SECONDS = 2;
export const G03_ROW_COUNT = 12;
export const G03_DURATION_FRAMES = Math.round((G03_INTRO_SECONDS + G03_ROW_COUNT * G03_ROW_SECONDS) * FPS);

export const G04_STEM_SECONDS = 4;
export const G04_THINK_SECONDS = 3;
export const G04_HOLD_SECONDS = 6;
export const G04_DURATION_FRAMES = (G04_STEM_SECONDS + G04_THINK_SECONDS + G04_HOLD_SECONDS) * FPS;

export const framesForMs = (ms: number) => Math.ceil((ms * FPS) / 1000);
