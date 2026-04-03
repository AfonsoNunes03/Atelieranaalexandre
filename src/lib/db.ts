import { supabase } from "./supabase";
import type { Database } from "./database.types";

type Obra = Database["public"]["Tables"]["obras"]["Row"];
type ObraInsert = Database["public"]["Tables"]["obras"]["Insert"];
type ContactoInsert = Database["public"]["Tables"]["contactos"]["Insert"];
type Contacto = Database["public"]["Tables"]["contactos"]["Row"];
type NewsletterRow = Database["public"]["Tables"]["newsletter"]["Row"];
type ConfigRow = Database["public"]["Tables"]["config_site"]["Row"];
type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];

// ── Obras ─────────────────────────────────────────────────────────────────────

export async function getObras(): Promise<Obra[]> {
  try {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) {
      console.warn("Supabase error (using fallback):", error.message);
      return [];
    }
    return (data as Obra[]) ?? [];
  } catch (e) {
    console.warn("Supabase connection error (using fallback):", e);
    return [];
  }
}

export async function getObraById(id: string): Promise<Obra | null> {
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Obra;
}

export async function getObraBySlug(slug: string): Promise<Obra | null> {
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Obra;
}

export async function getObrasDestaque(): Promise<Obra[]> {
  try {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .eq("destaque", true)
      .order("ordem", { ascending: true })
      .limit(6);
    if (error) {
      console.warn("Supabase error (using fallback):", error.message);
      return [];
    }
    return (data as Obra[]) ?? [];
  } catch (e) {
    console.warn("Supabase connection error (using fallback):", e);
    return [];
  }
}

// ── Contactos ─────────────────────────────────────────────────────────────────

export async function enviarContacto(contacto: ContactoInsert): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("contactos") as any).insert(contacto);
  if (error) throw error;
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string): Promise<"ok" | "already_subscribed"> {
  const { data: existing } = await supabase
    .from("newsletter")
    .select("id, ativo")
    .eq("email", email)
    .single();

  const row = existing as { id: string; ativo: boolean } | null;

  if (row) {
    if (!row.ativo) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("newsletter") as any).update({ ativo: true }).eq("email", email);
      return "ok";
    }
    return "already_subscribed";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("newsletter") as any).insert({ email });
  if (error) throw error;
  return "ok";
}

// ── Config ────────────────────────────────────────────────────────────────────

export async function getConfig(chave: string): Promise<string | null> {
  const { data } = await supabase
    .from("config_site")
    .select("valor")
    .eq("chave", chave)
    .single();
  const row = data as { valor: string } | null;
  return row?.valor ?? null;
}

// ── Admin: Obras CRUD ──────────────────────────────────────────────────────────

export async function createObra(obra: ObraInsert): Promise<Obra> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("obras") as any)
    .insert(obra)
    .select()
    .single();
  if (error) {
    console.error("[createObra] Erro ao inserir obra:", error.message, error.details, error.hint);
    throw error;
  }
  return data as Obra;
}

export async function updateObra(id: string, updates: Partial<ObraInsert>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("obras") as any).update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteObra(id: string): Promise<void> {
  const { error } = await supabase.from("obras").delete().eq("id", id);
  if (error) throw error;
}

// ── Admin: Contactos ───────────────────────────────────────────────────────────

export async function getContactosAdmin(): Promise<Contacto[]> {
  const { data, error } = await supabase
    .from("contactos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Contacto[]) ?? [];
}

export async function marcarContactoLido(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("contactos") as any).update({ lido: true }).eq("id", id);
  if (error) throw error;
}

export async function deleteContacto(id: string): Promise<void> {
  const { error } = await supabase.from("contactos").delete().eq("id", id);
  if (error) throw error;
}

// ── Admin: Newsletter ──────────────────────────────────────────────────────────

export async function getNewsletterAdmin(): Promise<NewsletterRow[]> {
  const { data, error } = await supabase
    .from("newsletter")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as NewsletterRow[]) ?? [];
}

export async function toggleNewsletterStatus(id: string, ativo: boolean): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("newsletter") as any).update({ ativo }).eq("id", id);
  if (error) throw error;
}

export async function createVenda(venda: VendaInsert): Promise<string | null> {
  const { data, error } = await (supabase.from("vendas") as any)
    .insert(venda)
    .select()
    .single();
    
  if (error) {
    console.error("[createVenda] Erro detalhado:", error.message, error.details, error.hint);
    throw error;
  }
  return data?.id || null;
}

export async function updateObraStatus(id: string, estado: "disponivel" | "reservado" | "vendido"): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("obras") as any).update({ estado }).eq("id", id);
  if (error) throw error;
}

// ── Admin: Config ─────────────────────────────────────────────────────────────

export async function getConfigAll(): Promise<ConfigRow[]> {
  const { data, error } = await supabase.from("config_site").select("*");
  if (error) throw error;
  return (data as ConfigRow[]) ?? [];
}

export async function updateConfigAdmin(chave: string, valor: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("config_site") as any)
    .upsert({ chave, valor }, { onConflict: "chave" });
  if (error) throw error;
}

// ── Admin: Vendas ─────────────────────────────────────────────────────────────

type VendaRow = Database["public"]["Tables"]["vendas"]["Row"];

export async function getVendasAdmin(): Promise<VendaRow[]> {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VendaRow[]) ?? [];
}

export async function updateVendaEstado(
  id: string,
  estado: "pendente" | "pago" | "enviado" | "cancelado"
): Promise<void> {
  const { error } = await supabase.from("vendas").update({ estado }).eq("id", id);
  if (error) throw error;
}

// ── Admin: Stats ───────────────────────────────────────────────────────────────

export async function getStatsAdmin(): Promise<{
  totalObras: number;
  mensagensNaoLidas: number;
  totalNewsletter: number;
  vendasTotal: number;
}> {
  const [obras, mensagens, newsletter, vendas] = await Promise.all([
    supabase.from("obras").select("id", { count: "exact", head: true }),
    supabase.from("contactos").select("id", { count: "exact", head: true }).eq("lido", false),
    supabase.from("newsletter").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("vendas").select("total").neq("estado", "cancelado"),
  ]);

  const totalVendas = (vendas.data as { total: number }[] ?? []).reduce((acc, curr) => acc + (curr.total || 0), 0);

  return {
    totalObras: obras.count ?? 0,
    mensagensNaoLidas: mensagens.count ?? 0,
    totalNewsletter: newsletter.count ?? 0,
    vendasTotal: totalVendas,
  };
}

// ── Storage: Upload de Imagens ─────────────────────────────────────────────────

export async function uploadObraImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload direto para a raiz do bucket 'obras' (sem sub-pasta aninhada)
  const { error } = await supabase.storage
    .from("obras")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("obras")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteObraImage(imageUrl: string): Promise<void> {
  // Extrai o nome do ficheiro da URL pública
  const urlParts = imageUrl.split("/storage/v1/object/public/obras/");
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from("obras")
    .remove([filePath]);

  if (error) console.error("Erro ao eliminar imagem:", error);
}
