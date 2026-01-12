import React, { useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { login, registerOwner } from "../../features/auth/thunks";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useSelector((s: RootState) => s.auth.loading);

  const onSubmit = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Введите email и пароль.");
      return;
    }

    // Fake auth mode for development
    if (import.meta.env.VITE_FAKE_AUTH === "true") {
      console.log("[FAKE AUTH] Using fake auth mode.");
      dispatch({
        type: "auth/login/fulfilled",
        payload: { accessToken: "FAKE_TOKEN_FOR_DEV", refreshToken: null },
      } as any);
      navigate("/");
      return;
    }

    try {
      if (isRegister) {
        // Register as shop owner
        if (!firstName.trim() || !lastName.trim()) {
          setError("Введите имя и фамилию.");
          return;
        }
        const res = await dispatch(registerOwner({ email, password, firstName, lastName }));
        if (res.type === "auth/registerOwner/fulfilled") {
          // After registration, login
          const loginRes = await dispatch(login({ username: email, password }));
          if (loginRes.type === "auth/login/fulfilled") {
            navigate("/");
          } else {
            setError("Регистрация успешна. Войдите с вашими данными.");
          }
        } else {
          const payload: any = (res as any).payload;
          setError(payload?.message || payload?.error_description || "Ошибка регистрации.");
        }
      } else {
        // Login
        const res = await dispatch(login({ username: email, password }));
        if (res.type === "auth/login/fulfilled") {
          navigate("/");
        } else {
          const payload: any = (res as any).payload;
          setError(payload?.error_description || payload?.message || "Неверный email или пароль.");
        }
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Неизвестная ошибка");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid md:grid-cols-2 max-w-4xl w-full bg-[var(--card)] rounded-2xl overflow-hidden shadow-xl">

        {/* Left side */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-semibold mb-3">
            {isRegister ? "Создайте аккаунт" : "Войти в аккаунт"}
          </h1>

          <p className="text-[var(--muted-foreground)] mb-8">
            {isRegister 
              ? "Заполните данные для создания магазина." 
              : "Введите ваши данные для входа."}
          </p>

          <div className="space-y-4">
            {isRegister && (
              <>
                <Input
                  type="text"
                  placeholder="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </>
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              onClick={onSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Загрузка..." : (isRegister ? "Зарегистрироваться" : "Войти")}
            </Button>

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
          </div>

          <div className="mt-6 text-sm text-[var(--muted-foreground)] flex justify-between">
            <span>{isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}</span>
            <button 
              className="underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-8 leading-relaxed">
            Продолжая, вы соглашаетесь с нашими{" "}
            <span className="underline">Условиями использования</span> и{" "}
            <span className="underline">Политикой конфиденциальности</span>.
          </p>
        </div>

        {/* Right side (image) */}
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
