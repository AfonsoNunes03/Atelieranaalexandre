
// Auto-generated types — regenerate after schema changes with:
// npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      obras: {
        Row: {
          id: string;
          created_at: string;
          titulo: string;
          tecnica: string;
          dimensoes: string | null;
          ano: number | null;
          preco: number | null;
          estado: "disponivel" | "reservado" | "vendido";
          descricao: string | null;
          imagem_url: string | null;
          slug: string | null;
          destaque: boolean;
          ordem: number;
        };
        Insert: Omit<Database["public"]["Tables"]["obras"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["obras"]["Insert"]>;
      };
      contactos: {
        Row: {
          id: string;
          created_at: string;
          nome: string;
          email: string;
          telefone: string | null;
          assunto: string | null;
          mensagem: string;
          lido: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["contactos"]["Row"], "id" | "created_at" | "lido">;
        Update: Partial<Database["public"]["Tables"]["contactos"]["Row"]>;
      };
      newsletter: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          ativo: boolean;
        };
        Insert: { email: string };
        Update: Partial<Database["public"]["Tables"]["newsletter"]["Row"]>;
      };
      config_site: {
        Row: {
          id: string;
          chave: string;
          valor: string;
          updated_at: string;
        };
        Insert: { chave: string; valor: string };
        Update: { valor?: string };
      };
    };
  };
}
