
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {

  const logo = PlaceHolderImages.find(p => p.id === 'ncc-logo');

  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center space-y-16 text-center bg-card/70 backdrop-blur-sm p-8 md:p-16 rounded-xl shadow-2xl border border-white/20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl font-bold tracking-wider text-primary md:text-6xl"
        >
          2(TN) ARMD SQN NCC TRICHY
        </motion.h1>

        <div className="flex w-full flex-col items-center justify-around space-y-8 md:flex-row md:items-center md:space-y-0">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-5xl font-semibold text-secondary"
          >
            UNITY
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            {logo && <Image src={logo.imageUrl} width={200} height={200} alt="NCC Logo" data-ai-hint={logo.imageHint} />}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-5xl font-semibold text-secondary"
          >
            DISCIPLINE
          </motion.h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center space-y-2"
        >
          <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
          <Link href="/institutions">
            <Button size="lg" className="text-lg bg-accent text-accent-foreground hover:bg-accent/90">
              Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
