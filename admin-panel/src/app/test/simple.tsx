export default function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🧪 Страница тестирования работает!</h1>
      <p>Если вы видите это сообщение, значит маршрутизация Next.js работает правильно.</p>
      
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <h2 className="text-lg font-semibold">Простые тесты:</h2>
        <button 
          onClick={() => alert('Кнопка работает!')}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Тест кнопки
        </button>
      </div>
    </div>
  );
}
