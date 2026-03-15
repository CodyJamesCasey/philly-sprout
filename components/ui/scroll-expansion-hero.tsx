"use client";

import {
  useEffect,
  useState,
  ReactNode,
} from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [viewportHeight, setViewportHeight] = useState<number>(1);

  const { scrollY } = useScroll();

  useEffect(() => {
    const updateViewportHeight = (): void => {
      setViewportHeight(window.innerHeight || 1);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  // Drive hero expansion by the first ~90% viewport scroll distance.
  const rawProgress = useTransform(scrollY, [0, viewportHeight * 0.9], [0, 1], {
    clamp: true,
  });
  const scrollProgress = useSpring(rawProgress, {
    stiffness: 180,
    damping: 32,
    mass: 0.25,
  });

  const mediaWidth = useTransform(
    scrollProgress,
    [0, 1],
    ["min(72vw, 320px)", "min(96vw, 1280px)"],
  );
  const mediaHeight = useTransform(
    scrollProgress,
    [0, 1],
    ["min(52vh, 380px)", "82dvh"],
  );
  const leftTextTransform = useTransform(
    scrollProgress,
    (value) => `translateX(-${value * 12}vw)`,
  );
  const rightTextTransform = useTransform(
    scrollProgress,
    (value) => `translateX(${value * 12}vw)`,
  );
  const bgOpacity = useTransform(scrollProgress, [0, 1], [1, 0]);
  const mediaOverlayOpacity = useTransform(scrollProgress, [0, 1], [0.7, 0.4]);
  const imageOverlayOpacity = useTransform(scrollProgress, [0, 1], [0.7, 0.4]);
  const showContentOpacity = useTransform(scrollProgress, [0.65, 1], [0, 1]);

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div
      className="transition-colors duration-700 ease-in-out overflow-x-hidden"
    >
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Background fades as media expands */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            style={{ opacity: bgOpacity }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={bgImageSrc}
              alt="Background"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              {/* Expanding media box */}
              <motion.div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl overflow-hidden"
                style={{
                  width: mediaWidth,
                  height: mediaHeight,
                  maxWidth: "96vw",
                  maxHeight: "82dvh",
                  boxShadow: "0px 0px 50px rgba(0, 0, 0, 0.3)",
                }}
              >
                {mediaType === "video" ? (
                  mediaSrc.includes("youtube.com") ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <iframe
                        width="100%"
                        height="100%"
                        src={
                          mediaSrc.includes("embed")
                            ? mediaSrc +
                              (mediaSrc.includes("?") ? "&" : "?") +
                              "autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1"
                            : mediaSrc.replace("watch?v=", "embed/") +
                              "?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=" +
                              mediaSrc.split("v=")[1]
                        }
                        className="w-full h-full rounded-xl"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }} />
                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        style={{ opacity: mediaOverlayOpacity }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full pointer-events-none">
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-xl"
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }} />
                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        style={{ opacity: mediaOverlayOpacity }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={mediaSrc}
                      alt={title || "Media content"}
                      fill
                      className="object-cover object-center rounded-xl"
                      sizes="(max-width: 768px) 96vw, 1280px"
                      priority
                    />
                    <motion.div
                      className="absolute inset-0 bg-black/30 rounded-xl"
                      style={{ opacity: imageOverlayOpacity }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {/* Date + scrollToExpand labels */}
                <div className="flex flex-col items-center text-center relative z-10 mt-3 transition-none px-2">
                  {date && (
                    <motion.p
                      className="text-base md:text-2xl text-white/95 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
                      style={{ transform: leftTextTransform }}
                    >
                      {date}
                    </motion.p>
                  )}
                  {scrollToExpand && (
                    <motion.p
                      className="text-sm md:text-base text-white/90 font-medium text-center mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
                      style={{ transform: rightTextTransform }}
                    >
                      {scrollToExpand}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Split-word title */}
              <div
                className={`flex items-center justify-center text-center gap-2 md:gap-4 w-full relative z-10 transition-none flex-col ${
                  textBlend ? "mix-blend-difference" : "mix-blend-normal"
                }`}
              >
                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white transition-none leading-tight drop-shadow-[0_3px_14px_rgba(0,0,0,0.6)]"
                  style={{ transform: leftTextTransform }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white transition-none leading-tight drop-shadow-[0_3px_14px_rgba(0,0,0,0.6)]"
                  style={{ transform: rightTextTransform }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            {/* Children — fades in after full expansion */}
            <motion.section
              className="flex flex-col w-full px-4 py-8 sm:px-8 sm:py-12 md:px-16 lg:py-20"
              initial={{ opacity: 0 }}
              style={{ opacity: showContentOpacity }}
              transition={{ duration: 0.35 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
