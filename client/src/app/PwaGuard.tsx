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
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        <IOSInstallInstructions />
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

// Стилизованная инструкция для iOS
const IOSInstallInstructions = () => (
  <div>
    <p style={{ marginBottom: "12px", color: "#495057" }}>
      Как установить приложение:
    </p>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          backgroundColor: "#e3f2fd",
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        <span style={{ color: "#1976d2" }}>«Поделиться»</span>
      </span>

      <span style={{ color: "#6c757d" }}>→</span>

      <span
        style={{
          backgroundColor: "#e8f5e9",
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        <span style={{ color: "#2e7d32" }}>«На экран Домой»</span>
      </span>
    </div>

    <p style={{ marginTop: "12px", fontSize: "12px", color: "#6c757d" }}>
      После установки приложение появится на главном экране
    </p>
  </div>
);
