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