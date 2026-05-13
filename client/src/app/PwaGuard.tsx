// components/PwaGuard.tsx
import React from "react";
import { usePwa } from "./lib/usePwa";

interface PwaGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Опционально: свой компонент-заглушку
}

export const PwaGuard: React.FC<PwaGuardProps> = ({ children, fallback }) => {
  const { isStandalone, isInstallable, installApp } = usePwa();

  const [showBanner, setShowBanner] = React.useState(true);

  // Если Pwa уже установлен и открыт в отдельном окне (или мы ДО ВСЕХ ПОР решим показывать контент)
  // Для тестирования можно временно закомментировать условие isStandalone
  if (isStandalone) {
    return <>{children}</>;
  }

  // Основная заглушка, если пользователь еще не установил Pwa
  const DefaultFallback = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1>📱 Установите приложение</h1>
      <p style={{ maxWidth: "400px", marginBottom: "30px" }}>
        Для лучшего опыта, пожалуйста, установите наше приложение на ваш
        телефон. Это позволит вам пользоваться им офлайн и с удобным
        интерфейсом.
      </p>

      {isInstallable ? (
        <button
          onClick={installApp}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Установить приложение
        </button>
      ) : (
        // Инструкция для iOS или браузеров, где нет нативной установки
        <div>
          <p>
            Нажмите на кнопку &quot;Поделиться&quot; и выберите &quot;На экран
            \&quot;Домой\&quot;&quot;
          </p>
        </div>
      )}

      {showBanner && (
        <button
          onClick={() => setShowBanner(false)}
          style={{
            marginTop: "20px",
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Продолжить в браузере
        </button>
      )}
    </div>
  );

  return <>{showBanner ? fallback || <DefaultFallback /> : children}</>;
};
