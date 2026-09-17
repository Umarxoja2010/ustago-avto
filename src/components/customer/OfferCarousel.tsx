import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { offers as fallbackOffers } from "@/lib/customer-data";
import { useDataText } from "@/lib/data-i18n";
import { useOffers } from "@/lib/hooks/use-offers";
import { cn } from "@/lib/utils";

interface CarouselOffer {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  accent: string;
  link?: string | null;
  badge?: string | null;
}

export function OfferCarousel() {
  const { t } = useTranslation("customer");
  const td = useDataText();
  const { data: apiOffers } = useOffers();
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const displayOffers: CarouselOffer[] =
    apiOffers && apiOffers.length > 0
      ? apiOffers.map((o) => ({
          id: String(o.id),
          title: o.title,
          subtitle: o.subtitle || "",
          cta: o.cta || "Batafsil",
          image: o.image,
          accent: o.accent || "from-amber-600 to-orange-700",
          link: o.link,
          badge: o.badge,
        }))
      : fallbackOffers.map((o) => ({
          ...o,
          link: "/search",
          badge: null,
        }));

  useEffect(() => {
    if (index >= displayOffers.length) {
      setIndex(0);
    }
  }, [displayOffers.length, index]);

  useEffect(() => {
    if (displayOffers.length <= 1) return;
    const interval = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % displayOffers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [displayOffers.length]);

  if (!displayOffers.length) return null;

  return (
    <div
      className="px-5"
      onPointerDown={() => (paused.current = true)}
      onPointerUp={() => (paused.current = false)}
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {displayOffers.map((offer) => {
            const cardContent = (
              <div className="relative h-40 overflow-hidden rounded-3xl group cursor-pointer">
                <img
                  src={offer.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className={cn("absolute inset-0 bg-gradient-to-r opacity-90", offer.accent)} />
                {offer.badge ? (
                  <div className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {offer.badge}
                  </div>
                ) : null}
                <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-6 text-primary-foreground">
                  <h3 className="max-w-[70%] text-xl font-semibold leading-tight drop-shadow-sm">
                    {td(offer.title)}
                  </h3>
                  <p className="max-w-[75%] text-sm text-primary-foreground/90 drop-shadow-sm line-clamp-2">
                    {td(offer.subtitle)}
                  </p>
                  <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-background/20 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors group-hover:bg-background/30">
                    {td(offer.cta)}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            );

            return (
              <div key={offer.id} className="w-full shrink-0">
                {offer.link ? (
                  <Link to={offer.link} className="block">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>
      </div>
      {displayOffers.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {displayOffers.map((o, i) => (
            <button
              key={o.id}
              aria-label={t("components.goToOffer", { index: i + 1 })}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
