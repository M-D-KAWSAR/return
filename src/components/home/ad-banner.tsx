"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface Ad {
  id: string;
  type: string;
  imageUrl: string | null;
  linkUrl: string | null;
  htmlCode: string | null;
  position: string;
}

interface AdBannerProps {
  ads: Ad[];
  position: string;
}

function HtmlAd({ htmlCode }: { htmlCode: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const temp = document.createElement("div");
    temp.innerHTML = htmlCode;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const script = document.createElement("script");
        const src = (node as HTMLScriptElement).src;
        if (src) script.src = src;
        script.async = true;
        script.innerHTML = (node as HTMLScriptElement).innerHTML;
        Array.from((node as HTMLScriptElement).attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });
        el.appendChild(script);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
  }, [htmlCode]);

  return <div ref={ref} className="w-full overflow-hidden" />;
}

export function AdBanner({ ads, position }: AdBannerProps) {
  const filtered = ads.filter((a) => a.position === position);
  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((ad) => {
        if (ad.type === "html" && ad.htmlCode) {
          return (
            <div key={ad.id} className="w-full overflow-hidden rounded-xl">
              <HtmlAd htmlCode={ad.htmlCode} />
            </div>
          );
        }

        if (ad.type === "image" && ad.imageUrl) {
          const inner = (
            <div className="relative w-full overflow-hidden rounded-xl bg-white/5">
              <Image
                src={ad.imageUrl}
                alt="Advertisement"
                width={1200}
                height={120}
                className="h-auto w-full object-contain"
                unoptimized
              />
            </div>
          );

          return ad.linkUrl ? (
            <a
              key={ad.id}
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {inner}
            </a>
          ) : (
            <div key={ad.id}>{inner}</div>
          );
        }

        return null;
      })}
    </div>
  );
}
