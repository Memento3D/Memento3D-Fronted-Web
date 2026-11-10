import { expect, it } from 'vitest';
import { readEventStream } from './sseTransport';

it('reads named events, multiline data and heartbeat across split CRLF and UTF-8 chunks', async () => {
  const bytes = new TextEncoder().encode(': heartbeat\r\nevent: ORDER_STATUS_CHANGED\r\ndata: {"message":\r\ndata: "Báo giá"}\r\n\r\n');
  const body = new ReadableStream<Uint8Array>({ start(controller) {
    for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
    controller.close();
  } });
  const messages: string[] = [];
  let activity = 0;
  await readEventStream(new Response(body, { headers: { 'Content-Type': 'text/event-stream' } }),
    new AbortController().signal, data => messages.push(data), () => { activity++; });
  expect(messages.map(data => JSON.parse(data))).toEqual([{ message: 'Báo giá' }]);
  expect(activity).toBeGreaterThan(0);
});

it('rejects HTML returned with status 200 instead of treating it as a live stream', async () => {
  await expect(readEventStream(new Response('<html>ngrok</html>', { headers: { 'Content-Type': 'text/html' } }),
    new AbortController().signal, () => {}, () => {})).rejects.toThrow('did not return an event stream');
});
