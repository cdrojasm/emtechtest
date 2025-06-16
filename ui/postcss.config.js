// postcss.config.js
import tailwindcss from '@tailwindcss/postcss'; // Importa desde el nuevo paquete
import autoprefixer from 'autoprefixer'; // Importa Autoprefixer (recomendado con Tailwind)
// Opcional: Si necesitas otros plugins de PostCSS como autoprefixer, impórtalos aquí.
// Tailwind CLI suele incluir autoprefixer por defecto, pero es bueno saber que puedes añadirlos.
// import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss, 
    autoprefixer,
  ],
};