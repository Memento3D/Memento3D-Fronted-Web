/** Fetch-based SSE: supports proxy headers and keeps credentials out of the URL. */
export async function readEventStream(
  response: Response,
  signal: AbortSignal,
  onEvent: (data: string) => void,
  onActivity: () => void,
): Promise<void> {
  if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
    throw new Error('Realtime endpoint did not return an event stream');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let data: string[] = [];
  const line = (value: string) => {
    if (value === '') {
      if (data.length) onEvent(data.join('\n'));
      data = [];
    } else if (value === 'data') data.push('');
    else if (value.startsWith('data:')) data.push(value.slice(5).replace(/^ /, ''));
  };
  try {
    while (!signal.aborted) {
      const chunk = await reader.read();
      if (chunk.done) break;
      onActivity();
      pending += decoder.decode(chunk.value, { stream: true });
      // Keep a trailing CR until the next chunk so split CRLF is handled once.
      let match: RegExpExecArray | null;
      while ((match = /\r\n|\r(?!$)|\n/.exec(pending))) {
        line(pending.slice(0, match.index));
        pending = pending.slice(match.index + match[0].length);
      }
      if (pending.length > 1024 * 1024) throw new Error('Realtime event exceeds size limit');
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
