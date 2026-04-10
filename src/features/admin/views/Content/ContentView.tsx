import { useState, useEffect } from "react";
import { getConfigAll, updateConfigAdmin, uploadSiteImage } from "../../../../lib/db";
import { motion } from "motion/react";
import { Layout, Type, Image as ImageIcon, Save, CheckCircle2, AlertCircle, Upload, Loader2 } from "lucide-react";
import { toast } from "../../../../lib/toast";

import { GOLD, SLATE } from "../../../../lib/tokens";

export function ConteudosSection() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setLoading(true);
    try {
      const data = await getConfigAll();
      setConfigs(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(chave: string, valor: string) {
    setSaving(chave);
    try {
      await updateConfigAdmin(chave, valor);
      toast.success("Conteúdo atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar campo");
    } finally {
      setSaving(null);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, chave: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(chave);
    try {
      const publicUrl = await uploadSiteImage(file, chave);
      // Atualiza localmente o valor da imagem para o preview
      setConfigs(prev => prev.map(c => c.chave === chave ? { ...c, valor: publicUrl } : c));
      // Salva na base de dados
      await updateConfigAdmin(chave, publicUrl);
      toast.success("Imagem carregada e atualizada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading(null);
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse">Carregando conteúdos...</div>;

  const textConfigs = configs.filter(c => !c.chave.includes('imagem') && !c.chave.includes('cor'));
  const imageConfigs = configs.filter(c => c.chave.includes('imagem') || c.chave.includes('hero_imagem'));

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto space-y-12">
      
      {/* ── Text Content Section ─────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Type size={20} />
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-800">Textos do Website</h2>
              <p className="text-sm text-slate-400">Altere os títulos e descrições principais do site.</p>
           </div>
        </div>

        <div className="grid gap-6">
          {textConfigs.map(config => (
            <div key={config.chave} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[0.65rem] uppercase tracking-widest font-black text-slate-400">
                  {config.chave.replace(/_/g, ' ')}
                </label>
                <button 
                  onClick={() => handleSave(config.chave, config.valor)}
                  disabled={saving === config.chave}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ 
                    background: saving === config.chave ? '#F1F5F9' : GOLD + '10',
                    color: saving === config.chave ? '#94A3B8' : GOLD 
                  }}
                >
                  {saving === config.chave ? "Salvando..." : <><Save size={12} /> Salvar Alteração</>}
                </button>
              </div>
              
              {config.valor.length > 100 ? (
                <textarea 
                  value={config.valor}
                  onChange={(e) => setConfigs(prev => prev.map(c => c.chave === config.chave ? {...c, valor: e.target.value} : c))}
                  rows={4}
                  className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#C9A96E40] text-slate-700 text-sm leading-relaxed outline-none"
                />
              ) : (
                <input 
                  type="text"
                  value={config.valor}
                  onChange={(e) => setConfigs(prev => prev.map(c => c.chave === config.chave ? {...c, valor: e.target.value} : c))}
                  className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#C9A96E40] text-slate-700 font-bold outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Image & Media Section ─────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <ImageIcon size={20} />
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-800">Imagens do Website</h2>
              <p className="text-sm text-slate-400">Substitua as imagens principais do site (Hero, Bio, etc).</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {imageConfigs.length > 0 ? imageConfigs.map(config => (
              <div key={config.chave} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                 <label className="text-[0.65rem] uppercase tracking-widest font-black text-slate-400">
                    {config.chave.replace(/_/g, ' ')}
                 </label>
                 <div className="aspect-video rounded-xl bg-slate-50 overflow-hidden relative group border border-slate-100">
                    <img src={config.valor} className="w-full h-full object-cover" alt="Preview" />
                    
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                       {uploading === config.chave ? (
                         <Loader2 size={24} className="text-white animate-spin" />
                       ) : (
                         <>
                           <Upload size={24} className="text-white mb-2" />
                           <span className="text-white text-xs font-bold">Alterar Imagem</span>
                         </>
                       )}
                       <input 
                         type="file" 
                         className="hidden" 
                         accept="image/*"
                         onChange={(e) => handleFileChange(e, config.chave)}
                         disabled={uploading === config.chave}
                       />
                    </label>
                 </div>
                 
                 <div className="flex items-center gap-2 text-[0.65rem] text-slate-400 bg-slate-50 p-2 rounded-lg truncate">
                    <ImageIcon size={10} />
                    <span className="truncate">{config.valor}</span>
                 </div>
              </div>
           )) : (
              <div className="md:col-span-2 text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                 <p className="text-sm text-slate-400">Nenhuma imagem configurada na base de dados.</p>
              </div>
           )}
        </div>
      </section>

      {/* ── Help Tip ────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-start gap-6">
         <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} className="text-emerald-400" />
         </div>
         <div>
            <h4 className="font-bold text-lg mb-2">Dica de Gestão</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
               As alterações feitas aqui aparecem instantaneamente para os teus clientes. <br />
               Lembra-te: textos curtos na Hero funcionam melhor para o design minimalista.
            </p>
         </div>
      </div>

    </div>
  );
}
