'use client';
import { motion } from 'framer-motion';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import AnimatedNumber from '../animate-number';

export default function CreditsCompanyData() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="flex flex-wrap w-full"
    >
      <div className="flex w-1/2">
        <div className="flex w-full justify-between">
          <motion.div
            className="flex gap-4 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="font-semibold text-lg">apple</div>
          </motion.div>

          {/* Avatar and Name 2 */}
          <motion.div
            className="flex gap-4 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="font-semibold text-lg ">koushik</div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center rounded-lg dark:bg-gray-900 shadow-xl bg-white p-6 h-12 w-full sm:w-auto border-2 border-[#1E90FF]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mr-2 text-base font-medium text-gray-800 dark:text-gray-200">
              Credit Distributed
            </div>
            <AnimatedNumber
              textClass="text-2xl font-semibold leading-[48px] text-center text-indigo-700 dark:text-indigo-300"
              value={5000000}
            />
          </motion.div>
        </div>
      </div>
      <div className="flex w-1/2" />
    </motion.div>
  );
}
