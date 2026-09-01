// デモ用画像。ネットワーク画像（picsum.photos のプレースホルダー写真）を使い、
// ロード失敗時は CoverImage コンポーネント側でグラデーションにフォールバックする。
export function coverImageUrl(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

// seed から決定的に色相を導き、フォールバック用グラデーションを作る
export function fallbackGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  const h1 = hash;
  const h2 = (hash + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1} 30% 82%), hsl(${h2} 35% 62%))`;
}
