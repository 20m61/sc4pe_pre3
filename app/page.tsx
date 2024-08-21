'use client'; // クライアントサイドで動作するファイルであることを指定

import { useState, useEffect } from 'react';

export default function Page() {
  const [input, setInput] = useState('');

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
    const audioContext = new window.AudioContext();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code.startsWith('Numpad')) {
        const number = event.key;
        setInput((prevInput) => prevInput + number);

        // 該当する音を再生
        if (noteFrequencies[number]) {
          playNote(audioContext, noteFrequencies[number]);
        }
      }
    };

    const playNote = (audioContext: AudioContext, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine'; // 波形のタイプを指定（ここでは正弦波）
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // 周波数を設定
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // 0.5秒後に音を止める
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      audioContext.close();
    };
  }, []);

  return (
    <div>
      <h1>テンキーでドレミファソラシドを再生</h1>
      <p>テンキーで数字を押して音を確認してください：</p>
      <div id="display">{input}</div>
    </div>
  );
}
