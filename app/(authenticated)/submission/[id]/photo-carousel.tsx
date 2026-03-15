"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PhotoCarousel({
  urls,
  alt,
}: {
  urls: string[];
  alt: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (urls.length === 1) {
    return (
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          <img
            src={urls[0]}
            alt={`${alt} photo`}
            className="w-full max-h-[400px] object-cover"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0 relative">
        <Carousel
          opts={{ loop: true }}
          className="w-full"
          setApi={(api) => {
            api?.on("select", () => {
              setCurrentIndex(api.selectedScrollSnap());
            });
          }}
        >
          <CarouselContent>
            {urls.map((url, i) => (
              <CarouselItem key={i}>
                <img
                  src={url}
                  alt={`${alt} photo ${i + 1}`}
                  className="w-full max-h-[400px] object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {urls.map((_, i) => (
            <span
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentIndex
                  ? "bg-white"
                  : "bg-white/50"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
