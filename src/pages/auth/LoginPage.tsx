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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-3xl mb-6 shadow-2xl border border-white/10 backdrop-blur-sm">
            <span className="text-3xl font-bold text-slate-900">FC</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            {isRegister ? "Создайте аккаунт" : "Вход в систему"}
          </h1>
          <p className="text-slate-400 text-lg">
            {isRegister 
              ? "Начните создавать свой магазин одежды" 
              : "Добро пожаловать обратно"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="space-y-5">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 backdrop-blur-sm"
                />
                <Input
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 backdrop-blur-sm"
                />
              </div>
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 backdrop-blur-sm"
            />

            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 backdrop-blur-sm"
            />

            <Button
              onClick={onSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-white to-gray-100 text-slate-900 hover:from-gray-100 hover:to-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Загрузка...
                </span>
              ) : (
                isRegister ? "Создать аккаунт" : "Войти"
              )}
            </Button>

            {error && (
              <div className={`p-3 border rounded-lg text-sm backdrop-blur-sm ${
                error.includes("Invalid user credentials") || 
                error.includes("Ошибка регистрации")
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-white/10 border-white/20 text-white'
              }`}>
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}
            </span>
            <button 
              className="ml-2 text-white text-sm hover:text-gray-300 transition-colors font-medium"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Продолжая, вы соглашаетесь с{" "}
            <button className="text-slate-400 hover:text-white transition-colors">
              Условиями использования
            </button>{" "}
            и{" "}
            <button className="text-slate-400 hover:text-white transition-colors">
              Политикой конфиденциальности
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
