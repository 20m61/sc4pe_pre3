'use client'; // このファイルがクライアントサイドで動作することを示す

import { useState, useEffect } from 'react';

export default function Page() {
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // テンキーの数字キー（Numpad0-Numpad9）
      if (event.code.startsWith('Numpad')) {
        const number = event.key;
        setInput((prevInput) => prevInput + number);
      }
    };

    // イベントリスナーの追加
    window.addEventListener('keydown', handleKeyDown);

    // クリーンアップ
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <h1>テンキーインタラクション</h1>
      <p>テンキーで数字を入力してください：</p>
      <div id="display">{input}</div>
    </div>
  );
}
