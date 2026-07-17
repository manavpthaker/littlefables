'use client';

// Minimal MediaRecorder wrapper. Handles mic-permission-denied by returning a
// null handle (the Checkpoint component surfaces a nudge instead of throwing).

export interface Recording {
  stop(): Promise<Blob>;
}

export async function startRecording(): Promise<Recording | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Choose a codec Whisper accepts. Chrome default is webm/opus.
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.addEventListener('dataavailable', (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    });
    recorder.start();

    return {
      stop() {
        return new Promise<Blob>((resolve) => {
          recorder.addEventListener('stop', () => {
            stream.getTracks().forEach((t) => t.stop());
            resolve(new Blob(chunks, { type: mimeType }));
          });
          recorder.stop();
        });
      },
    };
  } catch {
    return null;
  }
}
