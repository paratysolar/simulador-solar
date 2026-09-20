import { redirect } from 'next/navigation';

/** Página pública: apenas o simulador. CRM fica em /crm (auth). */
export default function Home() {
  redirect('/index.html');
}
