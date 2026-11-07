export function renderLesson(options: {
  lesson: string;
  composition: string;
  audio?: string;
  srt?: string;
  output: string;
  frames?: string;
  silentClean?: boolean;
  srtOutput?: string;
  infoOutput?: string;
  inputProps?: Record<string, unknown>;
  sidecars?: boolean;
  entry?: string;
}): Promise<void>;
