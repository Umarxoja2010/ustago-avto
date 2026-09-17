import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  Plus,
  Trash2,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import { useAuth, type UserPhone } from "@/lib/auth";
import { formatUzPhone, isValidUzPhone, normalizeUzPhone } from "@/lib/phone-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PhoneNumbersManager() {
  const { t } = useTranslation(["customer", "common"]);
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();

  const [newPhone, setNewPhone] = React.useState("+998");
  const [isAdding, setIsAdding] = React.useState(false);
  const [phoneToDelete, setPhoneToDelete] = React.useState<UserPhone | null>(null);

  // Fetch phones list
  const { data: phones = [], isLoading } = useQuery<UserPhone[]>({
    queryKey: ["user", "phones"],
    queryFn: async () => {
      const res = await api.get<UserPhone[]>("/user/phones");
      return res ?? [];
    },
    initialData:
      user?.phones ??
      (user?.phone
        ? [{ id: 1, phone: user.phone, isPrimary: true, scheduledDeletionAt: null, daysLeft: null }]
        : []),
  });

  const addPhoneMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await api.post<UserPhone[]>("/user/phones", { phone });
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["user", "phones"], data);
      await refreshUser();
      setNewPhone("+998");
      setIsAdding(false);
      toast.success(
        t("phones.addSuccess", { defaultValue: "Telefon raqam muvaffaqiyatli qo'shildi" }),
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? t(err.message, { defaultValue: err.message })
          : t("phones.addFailed", { defaultValue: "Raqamni qo'shishda xatolik yuz berdi" }),
      );
    },
  });

  const deletePhoneMutation = useMutation({
    mutationFn: async (phoneId: number) => {
      return await api.delete<UserPhone[]>(`/user/phones/${phoneId}`);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["user", "phones"], data);
      await refreshUser();
      setPhoneToDelete(null);
      toast.success(
        t("phones.deleteScheduled", {
          defaultValue:
            "Xavfsizlik sababli telefon raqam 14 kundan keyin butunlay tizimdan o'chiriladi.",
        }),
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? t(err.message, { defaultValue: err.message })
          : t("phones.deleteFailed", { defaultValue: "Raqamni o'chirishda xatolik yuz berdi" }),
      );
    },
  });

  const restorePhoneMutation = useMutation({
    mutationFn: async (phoneId: number) => {
      return await api.post<UserPhone[]>(`/user/phones/${phoneId}/restore`);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["user", "phones"], data);
      await refreshUser();
      toast.success(
        t("phones.restoreSuccess", {
          defaultValue: "Telefon raqamni o'chirish bekor qilindi va qayta faollashtirildi.",
        }),
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? t(err.message, { defaultValue: err.message })
          : t("phones.restoreFailed", { defaultValue: "Raqamni tiklashda xatolik yuz berdi" }),
      );
    },
  });

  const makePrimaryMutation = useMutation({
    mutationFn: async (phoneId: number) => {
      return await api.post<UserPhone[]>(`/user/phones/${phoneId}/primary`);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["user", "phones"], data);
      await refreshUser();
      toast.success(
        t("phones.primarySuccess", {
          defaultValue: "Asosiy telefon raqam muvaffaqiyatli o'zgartirildi.",
        }),
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? t(err.message, { defaultValue: err.message })
          : t("phones.primaryFailed", {
              defaultValue: "Asosiy raqamni o'zgartirishda xatolik yuz berdi",
            }),
      );
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUzPhone(newPhone)) {
      toast.error(
        t("phones.invalidPhone", {
          defaultValue: "Telefon raqamni to'liq kiriting (+998 XX-XXX-XX-XX)",
        }),
      );
      return;
    }
    addPhoneMutation.mutate(normalizeUzPhone(newPhone));
  };

  const totalCount = phones.length;
  const canAddMore = totalCount < 3;

  return (
    <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-4.5 sm:p-5 card-elevated">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Phone className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t("phones.title", { defaultValue: "Telefon raqamlar" })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("phones.subtitle", {
                defaultValue: "3 tagacha telefon raqam qo'shishingiz mumkin",
              })}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {totalCount} / 3
        </Badge>
      </div>

      {/* Security Explanation Panel (Kichik tushuntirish paneli) */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-3.5 text-xs text-foreground space-y-1.5">
        <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{t("phones.securityNoticeTitle", { defaultValue: "Xavfsizlik eslatmasi" })}</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {t("phones.securityNoticeBody", {
            defaultValue:
              "Hisobingiz xavfsizligini ta'minlash va firibgarlikning oldini olish maqsadida, o'chirilgan telefon raqamlar darhol emas, 14 kundan keyin tizimdan butunlay o'chiriladi. Ushbu muddat davomida raqamni istalgan vaqtda qayta tiklashingiz mumkin.",
          })}
        </p>
      </div>

      {/* Phone List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("common:loading", { defaultValue: "Yuklanmoqda..." })}
          </div>
        ) : (
          phones.map((item) => {
            const isDeleting = Boolean(item.scheduledDeletionAt);

            return (
              <div
                key={item.id}
                className={`relative flex flex-col gap-2 rounded-2xl border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                  isDeleting
                    ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20"
                    : "border-border/60 bg-muted/40"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {item.phone}
                    </span>
                    {item.isPrimary && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                        {t("phones.primary", { defaultValue: "Asosiy" })}
                      </Badge>
                    )}
                  </div>

                  {isDeleting ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {t("phones.scheduledDeletionBadge", {
                          days: item.daysLeft ?? 14,
                          defaultValue: `14 kundan keyin o'chiriladi (${item.daysLeft ?? 14} kun qoldi)`,
                        })}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isDeleting ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={restorePhoneMutation.isPending}
                      onClick={() => restorePhoneMutation.mutate(item.id)}
                      className="h-8 gap-1 rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 text-xs"
                    >
                      {restorePhoneMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      <span>{t("phones.restoreAction", { defaultValue: "Bekor qilish" })}</span>
                    </Button>
                  ) : (
                    <>
                      {!item.isPrimary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={makePrimaryMutation.isPending}
                          onClick={() => makePrimaryMutation.mutate(item.id)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {makePrimaryMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            t("phones.makePrimary", { defaultValue: "Asosiy qilish" })
                          )}
                        </Button>
                      )}
                      {!item.isPrimary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPhoneToDelete(item)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive active:scale-95 transition-transform"
                          aria-label={t("phones.deleteAction", { defaultValue: "O'chirish" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Phone */}
      {canAddMore && !isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full h-10 rounded-2xl border-dashed gap-1.5 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          <span>{t("phones.addNewPhone", { defaultValue: "Yangi telefon raqam qo'shish" })}</span>
        </Button>
      )}

      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="space-y-3 rounded-2xl bg-muted/40 p-3 border border-border/70"
        >
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-foreground">
              {t("phones.enterNewPhone", { defaultValue: "Yangi raqamni kiriting" })}
            </span>
            <Input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(formatUzPhone(e.target.value))}
              placeholder="+998 90-123-45-67"
              className="h-10 rounded-xl bg-background font-mono text-sm"
              maxLength={17}
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewPhone("+998");
              }}
              className="h-8 text-xs rounded-xl"
            >
              {t("common:cancel", { defaultValue: "Bekor qilish" })}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addPhoneMutation.isPending}
              className="h-8 gap-1.5 text-xs rounded-xl"
            >
              {addPhoneMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{t("common:add", { defaultValue: "Qo'shish" })}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Dialog with 14-day security explanation */}
      <AlertDialog
        open={phoneToDelete !== null}
        onOpenChange={(open) => !open && setPhoneToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl max-w-[420px]">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-center text-lg">
              {t("phones.confirmDeleteTitle", {
                defaultValue: "Raqamni o'chirishni tasdiqlaysizmi?",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs leading-relaxed space-y-2">
              <p>
                {t("phones.confirmDeleteDesc1", {
                  phone: phoneToDelete?.phone,
                  defaultValue: `${phoneToDelete?.phone} raqamini hisobingizdan o'chirishga so'rov yuborilmoqda.`,
                })}
              </p>
              <div className="rounded-2xl bg-muted/60 p-3 text-left font-normal text-muted-foreground">
                <span className="font-semibold text-foreground block mb-1">
                  🛡️ {t("phones.securityNoticeTitle", { defaultValue: "Xavfsizlik qoidasi" })}:
                </span>
                {t("phones.confirmDeleteDesc2", {
                  defaultValue:
                    "Ushbu raqam darhol emas, 14 kundan keyin tizimdan butunlay o'chiriladi. 14 kunlik muddat davomida istalgan payt 'Bekor qilish' tugmasi orqali raqamni qayta faollashtirishingiz mumkin.",
                })}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 sm:justify-center gap-2">
            <AlertDialogCancel className="rounded-xl h-10 px-4 text-xs">
              {t("common:cancel", { defaultValue: "Qoldirish" })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (phoneToDelete) {
                  deletePhoneMutation.mutate(phoneToDelete.id);
                }
              }}
              className="rounded-xl h-10 px-4 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePhoneMutation.isPending && (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              )}
              {t("phones.confirmDeleteButton", { defaultValue: "O'chirishni rejalashtirish" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
