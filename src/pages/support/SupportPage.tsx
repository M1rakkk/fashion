import React from "react";
import { HelpCircle, Mail, Phone, BookOpen } from "lucide-react";

const SupportPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Помощь и поддержка</h1>
        <p className="text-sm text-gray-400 mt-2">Ответы на вопросы, контакты и документация</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FAQ */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold">Часто задаваемые вопросы</h3>
          </div>
          <ul className="space-y-3 text-gray-300">
            <li>
              <strong>Как создать магазин?</strong> <br />
              Перейдите в Панель управления и нажмите "Новый магазин".
            </li>
            <li>
              <strong>Как добавить товары?</strong> <br />
              В редакторе магазина используйте раздел "Товары" (TODO: реализовать).
            </li>
            <li>
              <strong>Проблемы с авторизацией?</strong> <br />
              Проверьте email и OTP-код.
            </li>
          </ul>
        </div>

        {/* Контакты */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold">Контакты поддержки</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <a href="mailto:support@fashionconstruct.ru" className="hover:text-cyan-500">
                support@fashionconstruct.ru
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>+7 (123) 456-78-90</span>
            </div>
            <p>Время работы: Пн-Пт, 10:00-18:00 MSK</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Документация</h2>
        <p className="text-gray-400">Ссылки на гайды и API-доки (TODO: добавить реальные ссылки).</p>
      </div>
    </div>
  );
};

export default SupportPage;