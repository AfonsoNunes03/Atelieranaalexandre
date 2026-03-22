import image_b7b24245abcdea29bab902e1ad12d72e9afc2799 from 'figma:asset/b7b24245abcdea29bab902e1ad12d72e9afc2799.png'
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import artistPhoto from "figma:asset/ae632b3d89a4d086032a660429b1a01696ef459e.png";

const GOLD = "#C9A96E";

const artistImage = artistPhoto;

const galleryImage =
  "https://images.unsplash.com/photo-1723974591057-ccadada1f283?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBleGhpYml0aW9uJTIwbW9kZXJuJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NzM1OTI3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const exhibitions = [
  { year: "2025", name: "Galeria Municipal de Tomar (Solo)" },
  { year: "2023", name: "Galeria Municipal do Porto" },
  { year: "2022", name: "Bienal de Cerveira (Convidada)" },
  { year: "2020", name: "MARCO, Vigo" },
  { year: "2018", name: "FBAUP, Exposição Coletiva" },
];

export function SobrePage() {
  return (
    <div className="bg-[#fafaf8]">

      {/* ══ CHAPTER I ══ */}
      <section className="pt-16 pb-28 md:py-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <FadeIn>
              <div>
                <p className="text-[0.65rem] tracking-[0.3em] uppercase mb-6" style={{ color: GOLD }}>
                  Biografia
                </p>
                <h1
                  className="mb-8 leading-[1.05]"
                  style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a" }}
                >
                  Ana<br /><span className="italic">Alexandre</span>
                </h1>
                <p className="text-[1rem] text-[#666] leading-[1.9] mb-6"> artista plástica, investigadora e docente na área das Belas Artes.</p>
                <p className="text-[1rem] text-[#999] leading-[1.9] mb-6">Desde cedo encontrou no desenho e na pintura um espaço de construção e questionamento, entendendo a superfície pictórica como lugar de pensamento e possibilidade. A sua prática desenvolve-se num diálogo contínuo entre estrutura e sensibilidade, onde a pintura se afirma como campo de investigação estética e reflexão crítica.</p>
                <p className="text-[1rem] text-[#999] leading-[1.9]">
                  A sua atividade articula produção artística e investigação, assumindo a prática pictórica como território de construção de conhecimento.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} direction="right">
              <div className="aspect-[3/4] overflow-hidden bg-[#f0ebe4] hover:grayscale-0 transition-all duration-[1.5s]">
                <ImageWithFallback
                  src={artistImage}
                  alt="Ana Alexandre"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s]"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ QUOTE ══ */}
      <section className="py-28 relative overflow-hidden" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(8rem, 20vw, 18rem)", color: "rgba(0,0,0,0.025)", lineHeight: 1 }}
        >
          PhD
        </div>
        <div className="max-w-[780px] mx-auto px-6 md:px-12 text-center relative z-10">
          <FadeIn>
            <p
              className="italic leading-relaxed"
              style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.3rem, 3vw, 2rem)", color: "#555" }}
            >
              &ldquo;Arte, pensamento e docência convergem numa mesma matriz: a pintura como estrutura, linguagem e reflexão.&rdquo;
            </p>
            <div className="w-10 h-[1px] mx-auto mt-10" style={{ background: GOLD }} />
          </FadeIn>
        </div>
      </section>

      {/* ══ CHAPTER II ══ */}
      <section className="py-28 md:py-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <FadeIn direction="left">
              <div className="aspect-[4/5] overflow-hidden bg-[#fafaf8] hover:shadow-2xl transition-shadow duration-700">
                <ImageWithFallback
                  src={image_b7b24245abcdea29bab902e1ad12d72e9afc2799}
                  alt="Exposição"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-[1.2s] ease-out"
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <p className="text-[0.65rem] tracking-[0.3em] uppercase mb-6" style={{ color: GOLD }}>
                  Formação &bull; Percurso
                </p>
                <h2
                  className="mb-8 leading-[1.1]"
                  style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a" }}
                >
                  Academia &amp; <br />
                  <span className="italic">Investigação</span>
                </h2>
                <p className="text-[1rem] text-[#666] leading-[1.9] mb-6">
                  Licenciou-se em Pintura na Escola Universitária das Artes de Coimbra – ARCA (1995–2000) e concluiu o Mestrado em Pintura na Faculdade de Belas Artes da Universidade do Porto (2004–2006).
                </p>
                <p className="text-[1rem] text-[#666] leading-[1.9] mb-6">
                  Doutorou-se em Modos de Conhecimento na Prática Artística Contemporânea pela Faculdade de Belas Artes da Universidade de Vigo, com uma tese centrada nas problemáticas da pintura contemporânea, seus fundamentos conceptuais, enquadramentos críticos e dimensões epistemológicas.
                </p>
                <p className="text-[1rem] text-[#999] leading-[1.9] mb-10">
                  Participa regularmente em exposições nacionais e internacionais, integrando mostras individuais e coletivas. Desenvolve atividade docente no Instituto do Emprego e Formação Profissional e no Ensino Superior, nas áreas das artes visuais.
                </p>

                <div className="pl-6 space-y-4" style={{ borderLeft: `2px solid rgba(196,149,106,0.3)` }}>
                  {[...exhibitions].reverse().map((ex) => (
                    <div key={ex.year + ex.name} className="flex items-baseline gap-4">
                      <span className="text-[0.8rem] min-w-[45px]" style={{ color: GOLD }}>
                        {ex.year}
                      </span>
                      <span className="text-[0.85rem] text-[#888]">{ex.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 text-center" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-[580px] mx-auto px-6">
          <FadeIn>
            <h2 className="mb-6" style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a" }}>
              Visite o Atelier
            </h2>
            <p className="text-[1rem] text-[#777] leading-[1.8] mb-10">
              As obras ganham outra dimensão quando vistas ao vivo. Agende uma
              visita privada ou explore a mentoria artística.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contactos"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-white text-[0.75rem] tracking-[0.15em] uppercase hover:opacity-85 transition-opacity"
                style={{ background: GOLD }}
              >
                Agendar Visita
              </Link>
              <Link
                to="/mentoria"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-[0.75rem] tracking-[0.15em] uppercase transition-all border border-black/[0.12] text-[#888] hover:border-[#C4956A] hover:text-[#C4956A]"
              >
                Mentoria
                <ArrowRight size={15} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}