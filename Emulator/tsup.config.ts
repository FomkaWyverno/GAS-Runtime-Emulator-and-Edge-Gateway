import { defineConfig } from 'tsup';


export default defineConfig({
  entry: ['src/**/*.ts'], // Беремо всі твої файли
  format: ['esm'],        // Використовуємо ESM
  target: 'node24',      // Або твоя версія Node
  splitting: false,       // ВИМИКАЄМО злиття в один файл, щоб структура папок збереглася
  sourcemap: true,
  bundle: false,          // Не об'єднуємо бандли
  clean: true,            // Чистимо папку dist перед кожним білдом
  dts: false,             // Якщо не потрібні .d.ts файли
  outDir: 'dist/bin',
  minify: false,          // Не мініфікуємо для легшого дебагу
  // Важливо: залишаємо залежності окремо в node_modules
  // tsup автоматично не буде бандлити те, що є в package.json
});