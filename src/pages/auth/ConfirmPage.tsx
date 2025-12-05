import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { store } from "../../app/store"; 
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useNavigate } from "react-router-dom";
import { confirmOtp, sendLoginCode } from "../../features/auth/thunks";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const ConfirmPage: React.FC = () => {
  const email = useSelector((s: RootState) => s.auth.email);
  const loading = useSelector((s: RootState) => s.auth.loading);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const onChangeDigit = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const arr = [...code];
    arr[i] = value;
    setCode(arr);

    if (value && i < 3) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const onConfirm = async () => {
  const otp = code.join("");

  // Быстрый dev-фоллбек — если VITE_FAKE_AUTH=true в .env, симулируем success
  if (import.meta.env.VITE_FAKE_AUTH === "true") {
    dispatch({
      type: "auth/confirmOtp/fulfilled",
      payload: { accessToken: "FAKE_TOKEN_FOR_DEV" },
    } as any);
    console.log("[FAKE AUTH] forced success");
    navigate("/", { replace: true });
    return;
  }

  const res = await dispatch(confirmOtp({ email: email!, otp }));

  console.log("DISPATCH RESULT:", res);
  console.log("AUTH STATE AFTER:", store.getState().auth);

  if (res.meta?.requestStatus === "fulfilled") {
    console.log("OTP УСПЕШНО — ПЕРЕХОД НА DASHBOARD");
    navigate("/", { replace: true });
  } else {
    console.log("OTP НЕ ПРИНЯТ", res);
  }
};


  const resendCode = () => {
    if (email) dispatch(sendLoginCode(email));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid md:grid-cols-2 max-w-4xl w-full bg-[var(--card)] rounded-2xl overflow-hidden shadow-xl">

        {/* Левая часть */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold mb-3">Подтвердите ваш email</h1>

          <p className="text-[var(--muted-foreground)] mb-8">
            Мы отправили 4-значный код на{" "}
            <span className="text-white font-semibold">{email}</span>
          </p>

          <div className="flex justify-center gap-4 mb-8">
            {code.map((digit, i) => (
              <Input
                key={i}
                className="w-14 h-14 text-center text-2xl font-bold"
                maxLength={1}
                value={digit}
                onChange={(e) => onChangeDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                ref={(el) => (inputsRef.current[i] = el)}
              />
            ))}
          </div>

          <Button onClick={onConfirm} disabled={loading} className="w-full">
            {loading ? "Проверяем..." : "Подтвердить"}
          </Button>

          <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Не получили код?{" "}
            <button className="underline" onClick={resendCode}>
              Отправить снова
            </button>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-8 leading-relaxed">
            Продолжая, вы соглашаетесь с нашими{" "}
            <span className="underline">Условиями использования</span> и{" "}
            <span className="underline">Политикой конфиденциальности</span>.
          </p>
        </div>

        <div
          className="hidden md:block bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
      </div>
    </div>
  );
};

export default ConfirmPage;
