import React, { useState } from "react";
import { HelpCircle, Mail, Phone, MessageCircle, BookOpen, Send, Clock, MapPin, Star, ArrowRight } from "lucide-react";

const SupportPage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Как создать первый магазин?",
      answer: "Перейдите в дашборд и нажмите кнопку 'Создать магазин'. Заполните основную информацию и выберите дизайн.",
      icon: <Star className="w-4 h-4" />
    },
    {
      question: "Как добавить товары в магазин?",
      answer: "Откройте редактор магазина, перейдите в раздел 'Товары' и нажмите 'Добавить товар'. Загрузите фото и укажите цену.",
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      question: "Проблемы с входом в аккаунт?",
      answer: "Проверьте правильность email и пароля. Если забыли пароль, используйте функцию восстановления. При двухфакторной авторизации введите OTP-код.",
      icon: <HelpCircle className="w-4 h-4" />
    },
    {
      question: "Как настроить дизайн магазина?",
      answer: "В конструкторе магазина выберите тему оформления, загрузите логотип и настройте цвета под ваш бренд.",
      icon: <Star className="w-4 h-4" />
    }
  ];

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email поддержка",
      value: "support@fashionconstruct.ru",
      description: "Быстрый ответ в течение 24 часов",
      action: "Написать письмо"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Онлайн чат",
      value: "Доступен 24/7",
      description: "Мгновенная помощь операторов",
      action: "Начать чат"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Телефон поддержки",
      value: "+7 (123) 456-78-90",
      description: "Пн-Пт, 10:00-18:00 MSK",
      action: "Позвонить"
    }
  ];

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      {/* Заголовок с градиентом */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
          Помощь и поддержка
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Мы всегда готовы помочь вам создать успешный интернет-магазин одежды
        </p>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contactMethods.map((method, index) => (
          <div key={index} className="group relative bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <div className="text-blue-400">{method.icon}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
            <p className="text-slate-400 text-sm mb-3">{method.description}</p>
            <p className="text-white font-medium mb-4">{method.value}</p>
            <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
              {method.action}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ секция */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Частые вопросы</h2>
        </div>
        
        <div className="space-y-4 max-w-4xl">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-green-400">
                    {item.icon}
                  </div>
                  <span className="text-white font-medium">{item.question}</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                  expandedFaq === index ? 'rotate-180' : ''
                }`}>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
              
              {expandedFaq === index && (
                <div className="px-6 pb-4 border-t border-slate-700">
                  <p className="text-slate-300 pt-4">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Время работы</h3>
          </div>
          <div className="space-y-2 text-slate-300">
            <p><span className="text-white font-medium">Понедельник - Пятница:</span> 10:00 - 18:00</p>
            <p><span className="text-white font-medium">Суббота - Воскресенье:</span> Выходной</p>
            <p className="text-sm text-slate-400 mt-3">Чат поддержки доступен 24/7</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Офис</h3>
          </div>
          <div className="space-y-2 text-slate-300">
            <p>Москва, ул. Примерная, д. 123</p>
            <p>Бизнес-центр "Fashion Construct"</p>
            <p className="text-sm text-slate-400 mt-3">Прием посетителей по записи</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;