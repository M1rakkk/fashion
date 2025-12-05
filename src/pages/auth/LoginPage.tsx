import React, { useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { sendLoginCode } from "../../features/auth/thunks";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useSelector((s: RootState) => s.auth.loading);

  const onContinue = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Введите email.");
      return;
    }

    // 🔧 Фейковый режим (если бэка нет)
    if (import.meta.env.VITE_FAKE_AUTH === "true") {
      console.log("[FAKE AUTH] Используем фейковый режим входа.");

      dispatch({
        type: "auth/sendLoginCode/fulfilled",
        payload: { email },
      } as any);

      navigate("/confirm");
      return;
    }

    // 🔧 Реальный запрос
    try {
      const res = await dispatch(sendLoginCode(email));
      console.log("Ответ sendLoginCode:", res);

      if (res.type === "auth/sendLoginCode/fulfilled") {
        navigate("/confirm");
      } else {
        const payload: any = (res as any).payload;

        setError(
          payload?.message ||
            payload?.detail ||
            "Произошла ошибка. Проверьте корректность email."
        );
      }
    } catch (err: any) {
      console.error("Ошибка запроса:", err);
      setError(err?.message || "Неизвестная ошибка");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid md:grid-cols-2 max-w-4xl w-full bg-[var(--card)] rounded-2xl overflow-hidden shadow-xl">

        {/* Левая часть */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-semibold mb-3">
            Создайте свой магазин
          </h1>

          <p className="text-[var(--muted-foreground)] mb-8">
            Введите ваш email, чтобы начать регистрацию или войти.
          </p>

          <div className="space-y-5">
            <Input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              onClick={onContinue}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Отправляем..." : "Продолжить"}
            </Button>

            {/* Ошибка */}
            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
          </div>

          <div className="mt-6 text-sm text-[var(--muted-foreground)] flex justify-between">
            <span>Уже есть аккаунт?</span>
            <button className="underline">Войти</button>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-8 leading-relaxed">
            Продолжая, вы соглашаетесь с нашими{" "}
            <span className="underline">Условиями использования</span> и{" "}
            <span className="underline">Политикой конфиденциальности</span>.
          </p>
        </div>

        {/* Правая часть (картинка) */}
        <div className="hidden md:flex items-stretch">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
            alt="Login visual"
            className="w-full h-full object-cover"
            style={{ minHeight: 360 }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
