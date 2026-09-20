export const metadata = {
  title: 'Simulador de Energia Solar | On-Grid • Off-Grid • Híbrido • ROI',
  description: 'Simulador completo de energia solar com captura de leads',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
