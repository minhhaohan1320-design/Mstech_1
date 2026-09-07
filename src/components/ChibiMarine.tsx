import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { Upload } from 'lucide-react';

const CHIBI_POSITIONS = {
  bloodAngel: { x: '0%', y: '0%' },
  ultramarine: { x: '100%', y: '0%' },
  imperialFist: { x: '0%', y: '50%' },
  whiteScar: { x: '100%', y: '50%' },
  salamander: { x: '0%', y: '100%' },
  ironHand: { x: '100%', y: '100%' },
} as const;

export type ChibiChapter = keyof typeof CHIBI_POSITIONS;

interface Props {
  chapter: ChibiChapter;
  className?: string;
  bgColor?: string;
  borderColor?: string;
}

export const ChibiMarine: React.FC<Props> = ({ chapter, className = "", bgColor = "bg-gray-100", borderColor = "border-gray-200" }) => {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const localSprite = localStorage.getItem('chibiSprite');
      if (localSprite) {
        setSpriteUrl(localSprite);
      }
    } catch (e) {
      console.warn('localStorage error', e);
    }

    const spriteRef = ref(db, '/UI/chibiSprite');
    const unsubscribe = onValue(spriteRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setSpriteUrl(val);
        localStorage.setItem('chibiSprite', val);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        localStorage.setItem('chibiSprite', result);
        setSpriteUrl(result);
        
        try {
          await set(ref(db, '/UI/chibiSprite'), result);
        } catch (error) {
          console.error("Failed to sync sprite to Firebase:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!spriteUrl) {
    return (
      <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center text-center p-1 rounded-full border-2 border-dashed ${borderColor} relative cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
        <Upload className="w-5 h-5 text-gray-400 mb-1" />
        <span className="text-[7px] font-bold text-gray-500 leading-tight">Tải ảnh<br/>Chibi</span>
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden w-full h-full rounded-full border-2 ${borderColor} ${bgColor} ${className}`}
      title={`Warhammer 40k Chibi ${chapter}`}
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: '200% 300%',
          backgroundPosition: `${CHIBI_POSITIONS[chapter].x} ${CHIBI_POSITIONS[chapter].y}`,
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
};
