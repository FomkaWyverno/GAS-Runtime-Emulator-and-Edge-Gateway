# Статус підтримки методів

Нижче наведено таблицю відповідності реалізованих методів до оригінального API Google Apps Script.

## Utilities

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
  <thead>
    <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Метод</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Статус</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Опис обмежень / Реалізація</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>computeDigest</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #856404; font-weight: bold; text-align: center;">Частково</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Підтримує всі основні алгоритми (MD5, SHA-1, SHA-256 та ін.). <strong>Не підтримує MD2</strong> (викидає помилку).</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>base64Encode</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повна підтримка стандартного кодування з урахуванням вибору <code>Charset</code>.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>base64Decode</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Повна підтримка декодування у знаковий масив байтів (<code>Int8Array</code>).</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>base64EncodeWebSafe</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Реалізовано через заміну символів <code>+</code> на <code>-</code> та <code>/</code> на <code>_</code> згідно зі стандартом.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>base64DecodeWebSafe</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Зворотна заміна символів та стандартне декодування Base64.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>getUuid</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #c8e6c9; color: #256029; font-weight: bold; text-align: center;">Повністю</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Використовує нативний <code>crypto.randomUUID()</code> з Node.js.</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><code>formatDate</code></td>
      <td style="padding: 10px; border: 1px solid #ddd; background-color: #fff9c4; color: #856404; font-weight: bold; text-align: center;">Частково</td>
      <td style="padding: 10px; border: 1px solid #ddd;">Підтримує лише основні токени (<code>y, M, d, H, h, m, s, a</code>). Не підтримує екранування лапками та специфічні токени на кшталт <code>W, D, F, k, K</code>.</td>
    </tr>
  </tbody>
</table>

---

## Детальний опис часткової підтримки

Якщо метод позначений як **"Частково"**, нижче наведено конкретний перелік того, що саме в ньому реалізовано:

### `computeDigest`

У цьому методі реалізована підтримка лише сучасних та безпечних алгоритмів:

* **Підтримуються**: `MD5`, `SHA_1`, `SHA_256`, `SHA_384`, `SHA_512`.
* **Відсутня підтримка**: Алгоритм `MD2` заблоковано на рівні коду, оскільки він вважається застарілим і часто не підтримується сучасними версіями OpenSSL у Node.js.

### `formatDate`

Емуляція базується на `Intl.DateTimeFormat`, тому підтримується обмежений набір токенів Java SimpleDateFormat:

* **Рік**: `yyyy` (2026), `yy` (26).
* **Місяць**: `MMMM` (January), `MMM` (Jan), `MM` (01), `M` (1).
* **День**: `dd` (05), `d` (5).
* **Години**: `HH` (0-23), `H` (0-23), `hh` (01-12), `h` (1-12).
* **Хвилини/Секунди**: `mm`, `ss`.
* **Період**: `a` (AM/PM).
* **Обмеження**: Будь-які інші символи патерна, що не входять до списку вище (наприклад, тижні року `w`, мілісекунди `S` або часові пояси `z` у форматі патерна), не будуть оброблені коректно. Також не підтримується екранування тексту одинарними лапками всередині формату.