// hooks/usePwa.ts
import { useEffect, useState, useCallback } from "react";

// Кастомный тип для события BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const usePwa = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  // Состояние, установлено ли приложение как Pwa
  const [isInstalled, setIsInstalled] = useState(false);
  // Состояние, открыто ли приложение в режиме Pwa (standalone)
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Функция для проверки, открыто ли приложение как Pwa
  const checkIfPwaMode = useCallback(() => {
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);
    return isInStandaloneMode;
  }, []);

  // Функция для вызова установки
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.log("No install prompt available");
      return { outcome: "dismissed" };
    }

    // Показываем нативный диалог установки
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    // Событие можно использовать только один раз
    setDeferredPrompt(null);
    setIsInstallable(false);

    return { outcome };
  }, [deferredPrompt]);

  useEffect(() => {
    // 1. Проверяем, открыто ли уже приложение в Pwa-режиме
    checkIfPwaMode();

    // 2. Подписываемся на событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Сохраняем событие для последующего вызова
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Сообщаем, что приложение можно устанавливать
      setIsInstallable(true);
    };

    // 3. Подписываемся на событие успешной установки
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Для iOS, где нет beforeinstallprompt, просто проверяем режим standalone
    // Дополнительно отслеживаем изменение display-mode через matchMedia
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      }
    };
  }, [checkIfPwaMode]);

  return {
    isInstallable, // Можно ли предложить установку?
    isInstalled, // Установлено ли приложение? (Из события)
    isStandalone, // Открыто ли приложение в режиме Pwa? (Самый надежный флаг)
    installApp, // Функция для вызова установки
    deferredPrompt, // Само событие, на случай продвинутой логики
  };
};
