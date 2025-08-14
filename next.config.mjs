/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permite que el build de producción se complete exitosamente
    // incluso si hay errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite que el build de producción se complete exitosamente
    // incluso si hay errores de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
