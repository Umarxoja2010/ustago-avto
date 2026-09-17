import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toShopReview } from "@/lib/api-adapters";
import { useDataText } from "@/lib/data-i18n";
import { useMasterProfile, useMasterReviewsMine } from "@/lib/hooks/use-mechanic";

export const Route = createFileRoute("/mechanic/reviews")({
  component: ReviewsScreen,
});

function ReviewsScreen() {
  const { t } = useTranslation("mechanic");
  const td = useDataText();
  const { data: profile } = useMasterProfile();
  const { data: apiReviews } = useMasterReviewsMine();
  const reviews = (apiReviews ?? []).map(toShopReview);
  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-6 pt-8 card-elevated">
        <Link
          to="/mechanic/profile"
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-transform active:scale-90"
          aria-label={t("common:actions.back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("reviews.title")}
        </h1>
        <div className="mt-4 flex items-center gap-5">
          <div className="text-center">
            <p className="text-3xl font-semibold text-foreground">
              {(profile?.rating ?? 0).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("reviews.reviewsCount", { count: profile?.reviewCount ?? 0 })}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {buckets.map((b) => (
              <div key={b.star} className="flex items-center gap-2">
                <span className="w-3 text-[11px] text-muted-foreground">{b.star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(b.count / Math.max(reviews.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-3 px-5">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="animate-fade-in rounded-3xl border border-border/70 bg-card p-4 card-elevated"
          >
            <div className="flex items-center gap-3">
              <img src={r.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">{r.author}</p>
                <p className="text-xs text-muted-foreground">
                  {r.service ? `${td(r.service)} · ` : ""}
                  {r.date}
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{td(r.text)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
