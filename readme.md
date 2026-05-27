# Статус підтримки методів

Нижче наведено таблицю відповідності реалізованих методів до оригінального API Google Apps Script.

## Utilities

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>computeDigest</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #856404; font-weight: bold; text-align: center;">Частково</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Підтримує основні алгоритми (MD5, SHA-1, SHA-256 та ін.). <strong>Не підтримує MD2</strong>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>base64Encode</code> / <code>Decode</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повна підтримка з урахуванням <code>Charset</code> та знакових байтів (<code>Int8Array</code>).</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>base64EncodeWebSafe</code> / <code>DecodeWebSafe</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Коректна обробка символів <code>-</code>, <code>_</code> згідно зі стандартом.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getUuid</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Використовує нативний <code>crypto.randomUUID()</code>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>formatDate</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #856404; font-weight: bold; text-align: center;">Частково</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Підтримує лише основні токени. Не підтримує екранування лапками.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>newBlob</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Реалізовано всі перевантаження для рядків та масивів байтів.</td>
    </tr>
  </tbody>
</table>

---

## UrlFetchApp

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>fetch(url, params)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;"><b>Синхронний виклик.</b> Підтримує нормалізацію заголовків до нижнього регістру та автоматичну обробку <code>payload</code>.</td>
    </tr>
  </tbody>
</table>

---

## Blob & HTTPResponse

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getHeaders()</code> / <code>getAllHeaders()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Коректна емуляція ключів у нижньому регістрі. <code>getAllHeaders</code> підтримує масиви значень.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getContentText()</code> / <code>getContent()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Синхронне отримання даних у вигляді рядка або знакового масиву (Int8).</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getAs(type)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #856404; font-weight: bold; text-align: center;">Частково</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Змінює MIME-тип. Конвертація вмісту (напр. Google Doc -> PDF) не підтримується.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>isGoogleType()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffcccc; color: #cc0000; font-weight: bold; text-align: center;">Ні</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Завжди <code>false</code>.</td>
    </tr>
  </tbody>
</table>

---

## CacheService & Cache

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getScriptCache()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає інстанс кешу. Реалізовано як Singleton у межах життєвого циклу䔋 емулятора.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>get(key)</code> / <code>getAll(keys)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Синхронне отримання значень. Автоматично повертає <code>null</code>, якщо термін дії (expirationInSeconds) вичерпано.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>put(key, value, expirationInSeconds)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Сувора перевірка лімітів: ключ до 250 симв., значення до 100KB. Реалізовано ліміт у 1000 записів із витісненням за expirationInSeconds.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>putAll(values, expirationInSeconds)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Масовий запис об'єкта ключ-значення з валідацією кожного елемента.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>remove(key)</code> / <code>removeAll(keys)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Видалення одного або декількох записів зі сховища.</td>
    </tr>
  </tbody>
</table>

---

## SpreadsheetApp

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод / Об'єкт</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>openById(id)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Перевіряє існування таблиці синхронним запитом до MySQL. Кешує знайдені інстанси таблиць у внутрішній <code>Map</code>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getActive()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає поточну активну таблицю на основі параметра ідентифікатора з файлу конфігурації <code>config.json</code>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>flush()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Працює як безпечна порожня функція-заглушка (no-op), оскільки всі операції запису в емуляторі виконуються в базу даних миттєво.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getUi()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffcccc; color: #cc0000; font-weight: bold; text-align: center;">Ні</td>
      <td style="padding: 10px; border: 1px solid #ddd;"><b>Не підтримується.</b> Завжди викидає виключення, оскільки емулятор призначений для роботи в консольному (headless) середовищі.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>Menu</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffcccc; color: #cc0000; font-weight: bold; text-align: center;">Ні</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Методи <code>addItem</code> та <code>addToUi</code> викидають помилки виконання, інтерфейси користувача ігноруються.</td>
    </tr>
  </tbody>
</table>

---

## Spreadsheet

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод / Об'єкт</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getId()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає текстовий ідентифікатор таблиці, що відповідає оригінальному Google Spreadsheet ID.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getSheetByName(name)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Ініціалізує кеш аркушів (якщо не завантажено) та виконує миттєвий пошук об'єкта <code>Sheet</code> за назвою в оперативній пам'яті (<code>Map</code>).</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getSheetById(id)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #b78103; font-weight: bold; text-align: center;">Обмежено</td>
      <td style="padding: 10px; border: 1px solid #ddd;"><b>Працює локально.</b> Знаходить аркуш за id у Мапі. <i>Важливо:</i> оскільки при виклику insertSheet ID новому аркушу надається випадковий.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getSheets()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає масив усіх існуючих аркушів таблиці, відсортованих у порядку їхнього відображення.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>insertSheet(...)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">
        Повна колекція з 8 оригінальних перевантажень GAS. Створює новий аркуш, автоматично посуваючи індекси існуючих.
      </td>
    </tr>
    <tr>
  </tbody>
</table>

---

## Sheet

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод / Об'єкт</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getName()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає ім'я аркуша.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getSheetName()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає ім'я аркуша.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getParent()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає Spreadsheet таблицю де знаходиться аркуш.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getSheetId()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #b78103; font-weight: bold; text-align: center;">Обмежено</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає ідентифікатор аркуша! ЗАУВАЖТЕ! Створенний аркуш буде отримує ідентифікатор всередині емулятора, і ніяк не синхронізується з ніякими зовнішніми сервісами.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getIndex()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає індекс положення аркуша у списку таблиці.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>appendRow()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Додає у кінець аркуша рядок з даними.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getLastRow()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає останній рядок де містяться дані.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getLastColumn()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає номер останньої колонки де містяться дані.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>deleteColumn()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Видаляє вказану колонку чи колонки, та зсуває вліво всі колонки які були праворуч від видаленої. Функція повністю трансакційна.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>deleteRows()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Видаляє вказаний рядок чи рядки, та зсуває вверх всі рядки які були нижче від видаленего. Функція повністю трансакційна.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>clearContents()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Видаляє весь вміст аркуша.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>insertColumns()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Зсуває колонки у заданому індексу, і на певну кількість колонок. У самій бази данних записи без даних не існують, тому емулятор лише зсуває колонки вправо.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getRange()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повертає область аркуша.</td>
    </tr>
  </tbody>
</table>

---

## PropertiesService & Properties

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getScriptProperties()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Реалізовано за патерном Singleton. Повертає глобальний екземпляр сховища для поточного процесу.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getProperty(key)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Здійснює точковий пошук значення в MySQL за індексованим первинним ключем. Повертає <code>null</code>, якщо запис відсутній.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>setProperty(key, value)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Атомарний UPSERT-запит (<code>ON DUPLICATE KEY UPDATE</code>). Забезпечує збереження та оновлення даних за один цикл. Підтримує ланцюжкові виклики (chaining).</td>
    </tr>
  </tbody>
</table>

---

## ContentService & TextOutput

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод / Властивість</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>createTextOutput(content)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Створює повноцінний об'єкт-контейнер текстових відповідей <code>TextOutput</code> для Webhook-запитів.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>MimeType</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Підтримка оригінальної типізації даних: <code>CSV</code>, <code>ICAL</code>, <code>JAVASCRIPT</code>, <code>JSON</code>, <code>TEXT</code>, <code>VCARD</code>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getContent()</code> / <code>setContent()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Отримання та перезапис текстового контенту відповіді. Метод встановлення підтримує chaining.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getMimeType()</code> / <code>setMimeType()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Збереження та валідація форматів вихідних файлів відповідно до переліку <code>MimeType</code>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>append(content)</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Синхронно дописує вказаний текст у кінець існуючого буфера контенту.</td>
    </tr>
  </tbody>
</table>

---

## Browser

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод / Властивість</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>Buttons</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Прокидає нативний набір констант для кнопок діалогових вікон (<code>ButtonSet</code>): OK, YES_NO тощо.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>msgBox()</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffcccc; color: #cc0000; font-weight: bold; text-align: center;">Ні</td>
      <td style="padding: 10px; border: 1px solid #ddd;"><b>Не підтримується.</b> Генерує фатальну помилку через роботу емулятора в non-UI оточенні.</td>
    </tr>
  </tbody>
</table>

---

## Детальний опис обмежень

### `UrlFetchApp.fetch`

Емуляція реалізована через бібліотеку `sync-fetch` для імітації синхронної поведінки GAS (без `async/await`).

* **Заголовки**: Усі ключі (Headers) автоматично конвертуються у нижній регістр (lowercase) для відповідності стандарту Apps Script.
* **Payload**: Підтримує типи `String`, `Number[]`, `Blob` та `Object` (автоматично конвертується у `form-urlencoded`, якщо не вказано інший JSON заголовок).
* **SSL**: Параметр `validateHttpsCertificates` типізовано, проте за замовчуванням використовуються налаштування безпеки Node.js.

### `computeDigest`

* **Підтримуються**: `MD5`, `SHA_1`, `SHA_256`, `SHA_384`, `SHA_512`.
* **Відсутня підтримка**: Алгоритм `MD2` заблоковано, оскільки він вважається застарілим.

### `formatDate`

Емуляція базується на `Intl.DateTimeFormat`:
* **Токени**: `yyyy`, `yy`, `MMMM`, `MMM`, `MM`, `M`, `dd`, `d`, `HH`, `H`, `hh`, `h`, `mm`, `ss`, `a`.
* **Обмеження**: Не підтримуються складні токени (тижні `w`, мілісекунди `S`) та екранування тексту лапками.

### `Properties.setProperty`

* **MySQL Синтаксис**: На відміну від стандартних послідовних запитів перевірки, використовує швидку атомарну конструкцію бази даних `VALUES(property_values)`. Назви колонок повністю захищені від зарезервованих слів SQL зворотними лапками (backticks).