'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export default function Home() {
  return (
    <main className="bg flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center space-y-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl font-bold tracking-wider text-primary md:text-6xl"
        >
          2(TN) ARMD SQN NCC TRICHY
        </motion.h1>

        <div className="flex flex-col items-center space-y-8 md:flex-row md:items-center md:space-y-0 md:space-x-24 md:ml-24">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-3xl font-semibold text-primary md:text-5xl"
          >
            UNITY
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <img src="ncc_logo0.png" width={200} height={200} alt="NCC Logo" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-3xl font-semibold text-primary md:text-5xl"
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
            <Button size="lg" className="text-lg">
              Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
