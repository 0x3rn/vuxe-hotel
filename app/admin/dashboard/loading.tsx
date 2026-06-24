"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardLoading() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* HERO GREETING SKELETON */}
      <motion.div variants={itemVariants} className="bg-secondary p-8 rounded-2xl shadow-lg border border-secondary-foreground/10 relative overflow-hidden h-40">
        <div className="animate-pulse space-y-4 relative z-10">
          <div className="h-10 bg-secondary-foreground/20 rounded w-1/3"></div>
          <div className="h-6 bg-secondary-foreground/10 rounded w-2/3"></div>
        </div>
      </motion.div>

      {/* ROW 1 SKELETONS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={`r1-${i}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 flex items-center justify-between">
            <div className="animate-pulse w-full">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="animate-pulse w-12 h-12 bg-gray-100 rounded-full flex-shrink-0"></div>
          </div>
        ))}
      </motion.div>

      {/* ROW 2 SKELETONS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={`r2-${i}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 flex items-center justify-between">
            <div className="animate-pulse w-full">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="animate-pulse w-12 h-12 bg-gray-100 rounded-full flex-shrink-0"></div>
          </div>
        ))}
      </motion.div>

      {/* ROW 3 & 4 SKELETONS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="animate-pulse h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="p-6 space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={`table-${i}`} className="animate-pulse h-8 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="p-6 space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`feed-${i}`} className="flex gap-4 w-full" >
                <div className="animate-pulse w-2 h-2 mt-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <div className="animate-pulse w-full space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
