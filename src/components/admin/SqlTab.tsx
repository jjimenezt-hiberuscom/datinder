import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SqlTab() {
  const [sql, setSql] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/src/db/migration.sql')
      .then(r => r.text())
      .then(setSql)
      .catch(() => setSql('-- No se pudo cargar el SQL. Busca el archivo en src/db/migration.sql'));
  }, []);

  async function copiar() {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Script de migración Supabase</h3>
          <p className="text-muted-foreground text-sm">Copia y pega en el SQL Editor de tu proyecto Supabase</p>
        </div>
        <Button variant="outline" size="sm" onClick={copiar}>
          {copied ? <><Check className="w-4 h-4 mr-1 text-green-500" /> Copiado</> : <><Copy className="w-4 h-4 mr-1" /> Copiar SQL</>}
        </Button>
      </div>
      <pre className="bg-muted rounded-xl p-4 text-xs font-mono overflow-auto max-h-[60vh] leading-relaxed whitespace-pre-wrap">
        {sql || '-- Cargando...'}
      </pre>
    </div>
  );
}
