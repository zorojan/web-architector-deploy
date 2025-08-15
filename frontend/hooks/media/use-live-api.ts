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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { DEFAULT_LIVE_API_MODEL } from '../../lib/constants';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  reset: () => void;
  connected: boolean;
  lastError: string | null;

  volume: number;
};

export function useLiveApi({
  apiKey,
  model = DEFAULT_LIVE_API_MODEL,
}: {
  apiKey: string;
  model?: string;
}): UseLiveApiResults {
  const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey]);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [lastError, setLastError] = useState<string | null>(null);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      console.log('🔥 useLiveAPI: onOpen event fired - connection established');
      setConnected(true);
    };

    const onClose = (event?: any) => {
      console.log('🔒 useLiveAPI: onClose event fired - connection closed');
      console.log('🔒 useLiveAPI: Close event details:', {
        code: event?.code,
        reason: event?.reason,
        wasClean: event?.wasClean
      });
      
      // Handle specific error codes
      if (event?.code === 1011) {
        const errorMsg = 'QUOTA EXCEEDED: Your Google Gemini API key has exceeded its quota limits. Check Google Cloud Console billing and quotas.';
        setLastError(errorMsg);
        console.error('❌ QUOTA EXCEEDED: Your Google Gemini API key has exceeded its quota limits.');
        console.error('💡 Solutions:');
        console.error('   • Check your Google Cloud Console billing and quotas');
        console.error('   • Wait for quota reset (usually daily for free tier)');
        console.error('   • Enable billing for higher quotas');
        console.error('   • Generate a new API key with a different project');
        console.error('🔗 Google Cloud Console: https://console.cloud.google.com/');
      } else if (event?.code && event.code !== 1000) {
        setLastError(`Connection closed with error code ${event.code}: ${event.reason}`);
        console.warn(`⚠️ Connection closed with error code ${event.code}: ${event.reason}`);
      } else {
        setLastError(null); // Normal close
      }
      
      setConnected(false);
    };

    const onError = (error?: any) => {
      console.error('❌ useLiveAPI: onError event fired:', error);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    // Bind event listeners
    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('error', onError);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('error', onError);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
    };
  }, [client]);

  const connect = useCallback(async () => {
    console.log('🔗 useLiveAPI: Connect function called', { config, connected });
    
    if (!config) {
      console.error('❌ useLiveAPI: No config provided');
      throw new Error('config has not been set');
    }
    
    // Prevent multiple concurrent connections
    if (connected) {
      console.log('⚠️ useLiveAPI: Already connected, skipping');
      return;
    }
    
    // Clear any previous errors
    setLastError(null);
    
    try {
      // First ensure we're fully disconnected
      console.log('🔌 useLiveAPI: Ensuring clean disconnect...');
      if (client) {
        client.disconnect();
        // Wait for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('🔌 useLiveAPI: Starting connection with config:', config);
      const success = await client.connect(config);
      
      if (success) {
        console.log('✅ useLiveAPI: client.connect() completed successfully');
        // Add a timeout to check if connection stays open
        setTimeout(() => {
          if (!connected) {
            console.warn('⚠️ useLiveAPI: Connection completed but onOpen not fired after 2 seconds');
          }
        }, 2000);
      } else {
        console.error('❌ useLiveAPI: client.connect() returned false');
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('❌ useLiveAPI: Connection failed:', error);
      setConnected(false);
      throw error;
    }
  }, [client, config, connected]);

  const disconnect = useCallback(async () => {
    console.log('🔌 useLiveAPI: Disconnecting...');
    try {
      if (client) {
        client.disconnect();
      }
      setConnected(false);
      setVolume(0);
    } catch (error) {
      console.error('❌ useLiveAPI: Disconnect error:', error);
      setConnected(false);
    }
  }, [client]);

  const reset = useCallback(() => {
    console.log('🔄 useLiveAPI: Resetting connection...');
    try {
      // Force disconnect
      if (client) {
        client.disconnect();
      }
      
      setConnected(false);
      setVolume(0);
      setLastError(null);
      
      // Stop audio streamer
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
        audioStreamerRef.current = null;
      }
      
      // Reinitialize audio context after a delay
      setTimeout(() => {
        audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
          audioStreamerRef.current = new AudioStreamer(audioCtx);
          audioStreamerRef.current
            .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
              setVolume(ev.data.volume);
            })
            .then(() => {
              console.log('✅ useLiveAPI: Audio worklet reinitialized');
            })
            .catch(err => {
              console.error('❌ useLiveAPI: Error reinitializing worklet:', err);
            });
        });
      }, 1000);
      
      console.log('✅ useLiveAPI: Reset completed');
    } catch (error) {
      console.error('❌ useLiveAPI: Reset error:', error);
    }
  }, [client]);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    reset,
    lastError,
    volume,
  };
}
