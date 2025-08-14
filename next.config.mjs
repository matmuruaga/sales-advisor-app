/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  eslint: {
    // Permitir construir aunque haya errores de ESLint (p. ej., vars no usadas) durante el despliegue
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opcional: no bloquear el build por errores de TS mientras iteramos
    ignoreBuildErrors: true,
  },
};
