/**
 * Script para prevenir flash de tema en el primer render
 * Se ejecuta antes de que React se monte
 */
export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('erp-theme') || 'light';
        const root = document.documentElement;
        
        // Aplicar clase del tema
        root.classList.add('theme-' + theme);
        
        // Si es dark, agregar clase dark
        if (theme === 'dark') {
          root.classList.add('dark');
        }
      } catch (e) {
        console.error('Error loading theme:', e);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
