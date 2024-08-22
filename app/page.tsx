'use client';

import { useState, useEffect } from 'react';

export default function Page() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillators, setOscillators] = useState<{ [key: string]: OscillatorNode | null }>({});
  const [currentScaleIndex, setCurrentScaleIndex] = useState(0);

  const scales = [
    { name: 'メジャー', notes: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] },
    { name: 'マイナー', notes: [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25] },
    { name: 'ハーモニック・マイナー', notes: [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 493.88, 523.25] },
    { name: 'メロディック・マイナー', notes: [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 493.88, 523.25] },
    { name: 'ドリアン', notes: [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 466.16, 523.25] },
    { name: 'フリジアン', notes: [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25] },
    { name: 'リディアン', notes: [261.63, 293.66, 329.63, 370.00, 392.00, 440.00, 493.88, 523.25] },
    { name: 'ミクソリディアン', notes: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25] },
    { name: 'ブルース', notes: [261.63, 293.66, 311.13, 329.63, 392.00, 466.16, 523.25] },
    { name: 'ペンタトニック', notes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] },
  ];

  const currentScale = scales[currentScaleIndex];

  useEffect(() => {
    const context = new window.AudioContext();
    setAudioContext(context);

    const handleKeyDown = (event: KeyboardEvent) => {
      const number = event.key;
      if (event.code.startsWith('Numpad')) {
        if (number === '+') {
          setCurrentScaleIndex((prevIndex) => (prevIndex + 1) % scales.length);
        } else if (number === '-') {
          setCurrentScaleIndex((prevIndex) => (prevIndex - 1 + scales.length) % scales.length);
        } else if (!isNaN(Number(number))) {
          setActiveKeys((prevKeys) => {
            const newKeys = new Set(prevKeys);
            if (!newKeys.has(number)) {
              newKeys.add(number);
              startNote(context, number, currentScale.notes[parseInt(number) - 1]);
            }
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

    const startNote = (audioContext: AudioContext, key: string, frequency: number) => {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      osc.start();

      setOscillators((prevOscillators) => ({
        ...prevOscillators,
        [key]: osc,
      }));
    };

    const stopNote = (key: string) => {
      if (oscillators[key]) {
        const osc = oscillators[key];
        if (osc) {
          osc.stop();
          osc.disconnect();
          setOscillators((prevOscillators) => ({
            ...prevOscillators,
            [key]: null,
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (audioContext) audioContext.close();
    };
  }, [oscillators, currentScale]);

  return (
    <div>
      <h1>テンキーで和音を再生</h1>
      <p>現在のスケール: {currentScale.name}</p>
      <p>現在押されているキー：</p>
      <div id="display">
        {Array.from(activeKeys).join(', ')}
      </div>
    </div>
  );
}
