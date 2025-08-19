/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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

export function useLiveApiWidget({
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
      audioContext({ id: 'audio-out-widget' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out-widget', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            console.log('🎤 Widget: Audio worklet initialized');
          })
          .catch(err => {
            console.error('❌ Widget: Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      console.log('✅ Widget: Voice connection established');
      setConnected(true);
    };

    const onClose = (event?: any) => {
      console.log('🔒 Widget: Voice connection closed');
      
      // Handle specific error codes
      if (event?.code === 1011) {
        const errorMsg = 'QUOTA EXCEEDED: Your Google Gemini API key has exceeded its quota limits.';
        setLastError(errorMsg);
        console.error('❌ Widget: QUOTA EXCEEDED');
      } else if (event?.code && event.code !== 1000) {
        setLastError(`Connection closed with error code ${event.code}: ${event.reason}`);
        console.warn(`⚠️ Widget: Connection closed with error code ${event.code}: ${event.reason}`);
      } else {
        setLastError(null); // Normal close
      }
      
      setConnected(false);
    };

    const onError = (error?: any) => {
      console.error('❌ Widget: Voice error:', error);
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
    console.log('🎤 Widget: Connecting to voice...');
    
    if (!config) {
      console.error('❌ Widget: No config provided');
      throw new Error('config has not been set');
    }
    
    // Prevent multiple concurrent connections
    if (connected) {
      console.log('🎤 Widget: Already connected, skipping');
      return;
    }
    
    // Clear any previous errors
    setLastError(null);
    
    try {
      // First ensure we're fully disconnected
      if (client) {
        client.disconnect();
        // Wait for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('🎤 Widget: Starting connection...');
      const success = await client.connect(config);
      
      if (success) {
        console.log('✅ Widget: Connection completed successfully');
        // Add a timeout to check if connection stays open
        setTimeout(() => {
          if (!connected) {
            console.warn('⚠️ Widget: Connection completed but onOpen not fired after 2 seconds');
          }
        }, 2000);
      } else {
        console.error('❌ Widget: client.connect() returned false');
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('❌ Widget: Connection failed:', error);
      setConnected(false);
      throw error;
    }
  }, [client, config, connected]);

  const disconnect = useCallback(async () => {
    console.log('🔒 Widget: Disconnecting voice...');
    try {
      if (client) {
        client.disconnect();
      }
      setConnected(false);
      setVolume(0);
    } catch (error) {
      console.error('❌ Widget: Disconnect error:', error);
      setConnected(false);
    }
  }, [client]);

  const reset = useCallback(() => {
    console.log('🔄 Widget: Resetting voice connection...');
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
        audioContext({ id: 'audio-out-widget' }).then((audioCtx: AudioContext) => {
          audioStreamerRef.current = new AudioStreamer(audioCtx);
          audioStreamerRef.current
            .addWorklet<any>('vumeter-out-widget', VolMeterWorket, (ev: any) => {
              setVolume(ev.data.volume);
            })
            .then(() => {
              console.log('🎤 Widget: Audio worklet reinitialized');
            })
            .catch(err => {
              console.error('❌ Widget: Error reinitializing worklet:', err);
            });
        });
      }, 1000);
      
      console.log('✅ Widget: Reset completed');
    } catch (error) {
      console.error('❌ Widget: Reset error:', error);
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
