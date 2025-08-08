/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { audioContext, base64ToArrayBuffer, generateWaveFileHeader } from './utils';
import EventEmitter from 'eventemitter3';

export class AudioStreamer {
  audioContext: AudioContext | undefined;
  audioPlayback: AudioBufferSourceNode | undefined;

  private emitter = new EventEmitter();

  constructor(public sampleRate = 16000) {}

  on(event: string, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  private emit(event: string, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  async addBase64Chunk(chunk: string) {
    if (!this.audioContext) {
      this.audioContext = await audioContext({ sampleRate: this.sampleRate });
    }

    const arrayBuffer = base64ToArrayBuffer(chunk);
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Play the decoded audio
    if (this.audioPlayback) {
      this.audioPlayback.stop();
    }
    this.audioPlayback = this.audioContext.createBufferSource();
    this.audioPlayback.buffer = audioBuffer;
    this.audioPlayback.connect(this.audioContext.destination);
    this.audioPlayback.onended = () => {
      this.emit('ended');
    };
    this.audioPlayback.start();
    this.emit('started');
  }

  async addPCMChunk(float32Array: Float32Array) {
    if (!this.audioContext) {
      this.audioContext = await audioContext({ sampleRate: this.sampleRate });
    }

    const arrayBuffer = this.encodeWAV(float32Array);
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Play the decoded audio
    if (this.audioPlayback) {
      this.audioPlayback.stop();
    }
    this.audioPlayback = this.audioContext.createBufferSource();
    this.audioPlayback.buffer = audioBuffer;
    this.audioPlayback.connect(this.audioContext.destination);
    this.audioPlayback.onended = () => {
      this.emit('ended');
    };
    this.audioPlayback.start();
    this.emit('started');
  }

  stop() {
    if (this.audioPlayback) {
      this.audioPlayback.stop();
      this.audioPlayback = undefined;
    }
  }

  private encodeWAV(float32Array: Float32Array): ArrayBuffer {
    const length = float32Array.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const header = generateWaveFileHeader({
      sampleRate: this.sampleRate,
      numChannels: 1,
      length: length * 2,
    });

    // Copy header
    const headerView = new Uint8Array(header);
    const bufferView = new Uint8Array(arrayBuffer);
    bufferView.set(headerView, 0);

    // Convert float32 to int16
    const offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    return arrayBuffer;
  }
}
