-- Corrigir coluna stripe_id → stripe_session_id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='vendas' AND column_name='stripe_id') THEN
    ALTER TABLE vendas RENAME COLUMN stripe_id TO stripe_session_id;
  END IF;
END $$;

-- Adicionar colunas em falta
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS metodo_pagamento text
  DEFAULT 'transferencia'
  CHECK (metodo_pagamento IN ('stripe', 'transferencia'));
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS referencia text;

-- RLS: admin pode atualizar vendas
DROP POLICY IF EXISTS "vendas_auth_update" ON vendas;
CREATE POLICY "vendas_auth_update" ON vendas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Corrigir newsletter: remover policy aberta
DROP POLICY IF EXISTS "newsletter_public_update" ON newsletter;
DROP POLICY IF EXISTS "newsletter_auth_update" ON newsletter;
CREATE POLICY "newsletter_auth_update" ON newsletter
  FOR UPDATE USING (auth.role() = 'authenticated');
