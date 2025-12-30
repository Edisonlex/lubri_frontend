import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/pos',
  '/inventory',
  '/customers',
  '/analytics',
  '/obsolescence',
  '/classification',
  '/profile',
  '/settings',
];

// Rutas públicas
const publicRoutes = [
  '/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Obtener el token de autenticación de las cookies
  const authToken = request.cookies.get('user')?.value;
  
  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !authToken) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Si el usuario ya está autenticado y trata de acceder a login, redirigir al dashboard
  if (authToken && publicRoutes.includes(pathname)) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurar el middleware para que se ejecute solo en las rutas especificadas
export const config = {
  matcher: ['/dashboard/:path*', '/pos/:path*', '/inventory/:path*', '/customers/:path*', '/analytics/:path*', '/obsolescence/:path*', '/classification/:path*', '/profile/:path*', '/settings/:path*', '/login/:path*'],
};