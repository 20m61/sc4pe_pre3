'use client';

import { useState, useRef, useEffect } from 'react';

export default function Page() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [currentScaleIndex, setCurrentScaleIndex] = useState(0);
  const oscillatorsRef = useRef<{
    [key: string]: { osc: OscillatorNode; gain: GainNode } | null;
  }>({});

  const scales = [
    {
      name: 'メジャー',
      notes: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25],
    },
    {
      name: 'マイナー',
      notes: [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25],
    },
    {
      name: 'ハーモニック・マイナー',
      notes: [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 493.88, 523.25],
    },
    {
      name: 'メロディック・マイナー',
      notes: [261.63, 293.66, 311.13, 349.23, 392.0, 440.0, 493.88, 523.25],
    },
    {
      name: 'ドリアン',
      notes: [261.63, 293.66, 311.13, 349.23, 392.0, 440.0, 466.16, 523.25],
    },
    {
      name: 'フリジアン',
      notes: [261.63, 277.18, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25],
    },
    {
      name: 'リディアン',
      notes: [261.63, 293.66, 329.63, 370.0, 392.0, 440.0, 493.88, 523.25],
    },
    {
      name: 'ミクソリディアン',
      notes: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 466.16, 523.25],
    },
    {
      name: 'ブルース',
      notes: [261.63, 293.66, 311.13, 329.63, 392.0, 466.16, 523.25],
    },
    {
      name: 'ペンタトニック',
      notes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    },
  ];

  const currentScale = scales[currentScaleIndex];

  const startNote = (key: string, frequency: number) => {
    if (oscillatorsRef.current[key]) return; // 既にオシレーターが存在する場合は何もしない

    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    osc.start();

    oscillatorsRef.current[key] = { osc, gain: gainNode };
  };

  const stopNote = (key: string) => {
    const node = oscillatorsRef.current[key];
    if (node) {
      const { osc, gain } = node;
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext!.currentTime + 0.03
      );
      osc.stop(audioContext!.currentTime + 0.03);
      osc.disconnect();

      delete oscillatorsRef.current[key];
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const number = event.key;
    if (number === '0' || number === '9') {
      return;
    }
    if (event.code.startsWith('Numpad')) {
      if (number === '+') {
        setCurrentScaleIndex((prevIndex) => (prevIndex + 1) % scales.length);
      } else if (number === '-') {
        setCurrentScaleIndex(
          (prevIndex) => (prevIndex - 1 + scales.length) % scales.length
        );
      } else if (!isNaN(Number(number)) && !activeKeys.has(number)) {
        setActiveKeys((prevKeys) => {
          const newKeys = new Set(prevKeys);
          newKeys.add(number);
          startNote(number, currentScale.notes[parseInt(number) - 1]);
          return newKeys;
        });
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const number = event.key;
    if (event.code.startsWith('Numpad')) {
      setActiveKeys((prevKeys) => {
        const newKeys = new Set(prevKeys);
        newKeys.delete(number);
        stopNote(number);
        return newKeys;
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudioContext(new window.AudioContext());
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [currentScale]);

  return (
    <div>
      <h1>テンキーで和音を再生</h1>
      <p>現在のスケール: {currentScale.name}</p>
      <p>現在押されているキー：</p>
      <div id="display">{Array.from(activeKeys).join(', ')}</div>
    </div>
  );
}
