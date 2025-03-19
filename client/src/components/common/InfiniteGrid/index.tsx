"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface InfiniteGridProps {
  images: string[];
}

export default function InfiniteGrid({ images }: InfiniteGridProps) {
  const [duplicatedImages, setDuplicatedImages] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i >= 1; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j] ?? "";
      shuffled[j] = temp ?? "";
    }
    return shuffled;
  };

  useEffect(() => {
    setIsClient(true);
    const initialImages = Array(50)
      .fill(null)
      .flatMap(() => shuffleArray(images));
    setDuplicatedImages(initialImages);
  }, [images]);

  if (!isClient) return null;
  if (!duplicatedImages.length) return null;

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden opacity-80">
      <motion.div
        className="h-[200%] w-full p-2"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ y: 0 }}
        animate={{ y: "-50%" }}
        transition={{
          y: {
            duration: 60,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          },
        }}
      >
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
        >
          <Masonry gutter="8px">
            {duplicatedImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative overflow-hidden bg-gray-100 transition-all  duration-300 hover:z-10"
                style={{
                  backfaceVisibility: "hidden",
                  gridColumn: index % 3 === 0 ? "span 2" : "span 1",
                  gridRow: index % 3 === 0 ? "span 2" : "span 1",
                }}
              >
                <img
                  src={image}
                  alt={`Grid item ${index}`}
                  className={`h-auto w-full object-cover transition-transform duration-300 ${index % 3 === 0 ? "min-h-[400px]" : "min-h-[200px]"}`}
                  loading="lazy"
                />
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </motion.div>
    </div>
  );
}
