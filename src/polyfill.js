/**
 * Global polyfills for Jest + jsdom + Node 22
 * Covers: TextEncoder/Decoder, Streams, MessageChannel/MessagePort
 */

// --- fetch / Request / Response / Headers ---
import 'whatwg-fetch';

import { TextEncoder, TextDecoder } from 'node:util';

// --- TextEncoder / TextDecoder ---
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// --- Streams ---
try {
  const { ReadableStream, WritableStream, TransformStream } = require('stream/web');

  if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = ReadableStream;
  }
  if (typeof global.WritableStream === 'undefined') {
    global.WritableStream = WritableStream;
  }
  if (typeof global.TransformStream === 'undefined') {
    global.TransformStream = TransformStream;
  }
} catch (e) {
  console.warn('⚠️ Stream polyfills not available in this Node version:', e);
}

// --- MessageChannel / MessagePort ---
try {
  const { MessageChannel, MessagePort } = require('worker_threads');

  if (typeof global.MessageChannel === 'undefined') {
    global.MessageChannel = MessageChannel;
  }
  if (typeof global.MessagePort === 'undefined') {
    global.MessagePort = MessagePort;
  }
} catch (e) {
  console.warn('⚠️ worker_threads polyfills not available:', e);
}
