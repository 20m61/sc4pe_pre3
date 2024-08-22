'use client';

import { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioContext] = useState(() => new window.AudioContext());
  const [currentScaleIndex, setCurrentScaleIndex] = useState(0);
  const oscillatorsRef = useRef<{ [key: string]: { osc: OscillatorNode, gain: GainNode } | null }>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestIdRef = useRef<number | null>(null);

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

  const startNote = (key: string, frequency: number) => {
    if (oscillatorsRef.current[key]) return;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    osc.start();

    oscillatorsRef.current[key] = { osc, gain: gainNode };

    startVisualization(frequency);
  };

  const stopNote = (key: string) => {
    const node = oscillatorsRef.current[key];
    if (node) {
      const { osc, gain } = node;
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
      osc.stop(audioContext.currentTime + 0.03);
      osc.disconnect();

      delete oscillatorsRef.current[key];
    }
  };

  const startVisualization = (frequency: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // スパークするエフェクト
      const numSparks = 50;
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (frequency / 4);
        const x = canvas.width / 2 + distance * Math.cos(angle);
        const y = canvas.height / 2 + distance * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.fill();
      }

      requestIdRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVisualization = () => {
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const number = event.key;
    if (event.code.startsWith('Numpad')) {
      if (number === '+') {
        setCurrentScaleIndex((prevIndex) => (prevIndex + 1) % scales.length);
      } else if (number === '-') {
        setCurrentScaleIndex((prevIndex) => (prevIndex - 1 + scales.length) % scales.length);
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
        if (newKeys.size === 0) {
          stopVisualization(); // 全てのキーが離されたらビジュアライゼーションを停止
        }
        return newKeys;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopVisualization(); // コンポーネントがアンマウントされた時にビジュアライゼーションを停止
    };
  }, [currentScale]);

  return (
    <div>
      <h1>テンキーで和音を再生</h1>
      <p>現在のスケール: {currentScale.name}</p>
      <p>現在押されているキー：</p>
      <div id="display">
        {Array.from(activeKeys).join(', ')}
      </div>
      <canvas ref={canvasRef} width={800} height={600} style={{ background: 'black', marginTop: '20px' }} />
    </div>
  );
}
