## Diagnóstico
- El cambio de pestañas no se aplica porque el efecto en `src/app/analytics/page.tsx:200-207` reinicia `activeTab` a `"sales"` en cada render al incluir `validTabs` (un `new Set(...)` recreado en cada render) como dependencia.
- Al no sincronizar el parámetro `?tab=` al cambiar de pestaña, el efecto siempre cae en el `else` y vuelve a `"sales"`, anulando los clics.
- Los componentes de cada pestaña están correctos; el problema es de control de estado y sincronización con la URL.

## Cambios Propuestos
- Hacer `validTabs` estable (const a nivel de módulo) y quitarlo del arreglo de dependencias del efecto.
- Ajustar el `useEffect` para ejecutar solo cuando cambie `searchParams` y respetar `?tab=` si existe; si no existe, no forzar a `"sales"` continuamente.
- Sincronizar la pestaña activa al URL en `onValueChange`: usar `useRouter` y `usePathname` de `next/navigation` para hacer `router.replace(
  `${pathname}?${params.toString()}`,
  { scroll: false }
)` al seleccionar una pestaña.
- Mantener el auto‑scroll al tab activo y, opcionalmente, robustecer el selector de `useScrollIndicator` para usar `[data-state='active']` en lugar de `[data-value=...]`.

## Implementación (resumen de cambios)
- `src/app/analytics/page.tsx`:
  - Mover `validTabs` a nivel de módulo (const) y usarlo en el componente.
  - Importar `useRouter` y `usePathname` y actualizar `onValueChange` para escribir `?tab=`.
  - Cambiar `useEffect` a dependencia solo de `searchParams` y no re‑establecer `"sales"` en cada render cuando no hay `?tab=`.
- (Opcional) `src/hooks/use-scroll-indicator.tsx`: cambiar el selector a `[data-state='active']`.

## Verificación
- Correr la app, navegar a `/analytics` y hacer clic en: Ventas, Pronósticos, Rotación, Precios, Competencia, Reportes y Mapa.
- Confirmar que el contenido cambia, el parámetro `?tab=` se actualiza y que al recargar se mantiene la pestaña.
- Revisar la consola del navegador para asegurar ausencia de errores en cada pestaña.