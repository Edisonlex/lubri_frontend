import { ResponsiveTest } from '@/components/responsive-test'

export default function ResponsiveTestPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sistema Responsive - Prueba Completa</h1>
        <p className="text-gray-600">
          Esta página demuestra que el sistema es completamente responsive en todos los dispositivos.
          Prueba cambiando el tamaño de tu ventana para ver cómo se adaptan los componentes.
        </p>
      </div>
      
      <ResponsiveTest />
      
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">✅ Sistema Responsive Completado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-green-700">Características Implementadas:</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Breakpoints personalizados (xs, sm, md, lg, xl, 2xl, 3xl)</li>
              <li>• Componentes adaptativos para móviles</li>
              <li>• Grids responsivos dinámicos</li>
              <li>• Textos y espaciado optimizados</li>
              <li>• Mapas con detección de sidebar</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-blue-700">Módulos Optimizados:</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Dashboard con gráficos responsivos</li>
              <li>• Módulo de proveedores adaptativo</li>
              <li>• Análisis y reportes móvil-friendly</li>
              <li>• Sistema de mapas inteligente</li>
              <li>• Navegación optimizada para touch</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-center text-gray-600 font-medium">
            🎯 El sistema ahora es completamente responsive en <strong>todos los dispositivos</strong>
          </p>
        </div>
      </div>
    </div>
  )
}