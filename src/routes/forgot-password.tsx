import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: i18n.t("auth:forgotPassword.metaTitle") },
      {
        name: "description",
        content: i18n.t("auth:forgotPassword.metaDescription"),
      },
      { property: "og:title", content: i18n.t("auth:forgotPassword.metaTitle") },
      {
        property: "og:description",
        content: i18n.t("auth:forgotPassword.metaDescription"),
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
    toast.success(t("forgotPassword.resetInstructionsSent"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="card-elevated w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          {sent ? <MailCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          {sent ? t("forgotPassword.checkInbox") : t("forgotPassword.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent
            ? t("forgotPassword.sentMessage", { identifier })
            : t("forgotPassword.instructions")}
        </p>

        {sent ? null : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{t("forgotPassword.identifierLabel")}</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="rounded-xl"
                placeholder={t("forgotPassword.identifierPlaceholder")}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("forgotPassword.submit")}
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {t("forgotPassword.backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
