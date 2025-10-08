'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  

  return (
    <main
      className="relative bg flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
 
      
      <div className="flex flex-col items-center justify-center text-center space-y-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-6xl font-bold tracking-wider text-primary"
        >
          2(TN) ARMD SQN NCC TRICHY
        </motion.h1>

        <div className="flex space-x-12 md:space-x-24">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-3xl md:text-5xl font-semibold text-accent"
          >
            UNITY
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-3xl md:text-5xl font-semibold text-accent"
          >
            DISCIPLINE
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
  
            <img
              src="ncc_logo0.png"

              width={200}
              height={200}

            />

        </motion.div>
      </div>
    </main>
  );
}
