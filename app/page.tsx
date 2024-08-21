'use client'; // クライアントサイドで動作するファイルであることを指定
'use client'; // クライアントサイドで動作するファイルであることを指定

import { useState, useEffect } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  // ドレミファソラシドの周波数
  const noteFrequencies: { [key: string]: number } = {
    '1': 261.63, // ド (C4)
    '2': 293.66, // レ (D4)
    '3': 329.63, // ミ (E4)
    '4': 349.23, // ファ (F4)
    '5': 392.0, // ソ (G4)
    '6': 440.0, // ラ (A4)
    '7': 493.88, // シ (B4)
    '8': 523.25, // ド (C5)
  };

  useEffect(() => {
    const context = new window.AudioContext();
    setAudioContext(context);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code.startsWith('Numpad')) {
        const number = event.key;
        setInput((prevInput) => prevInput + number);

        // 該当する音を再生
        if (noteFrequencies[number]) {
          startNote(context, noteFrequencies[number]);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code.startsWith('Numpad') && oscillator) {
        stopNote();
      }
    };

    const startNote = (audioContext: AudioContext, frequency: number) => {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      osc.type = 'sine'; // 波形のタイプを指定（ここでは正弦波）
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime); // 周波数を設定
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);

      osc.start();
      setOscillator(osc);
    };

    const stopNote = () => {
      if (oscillator) {
        oscillator.stop();
        setOscillator(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (audioContext) audioContext.close();
    };
  }, [oscillator]);

  return (
    <div>
      <h1>テンキーでドレミファソラシドを再生</h1>
      <p>テンキーで数字を押して音を確認してください：</p>
      <div id="display">{input}</div>
    </div>
  );
}
