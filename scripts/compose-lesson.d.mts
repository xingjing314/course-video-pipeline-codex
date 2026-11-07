export function composeLesson(options: Record<string, string>): Promise<{
  video: string;
  wav: string;
  srt: string;
  info: string;
}>;
