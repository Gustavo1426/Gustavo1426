/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Search, 
  Send, 
  Paperclip, 
  Video, 
  Music, 
  FileText, 
  Image as ImageIcon,
  Check,
  CheckCheck,
  Bot,
  User,
  Sparkles,
  Zap,
  Clock,
  Mic,
  Smile
} from "lucide-react";
import { Student } from "../../../types";

interface Message {
  id: string;
  sender: "coach" | "student";
  text: string;
  timestamp: string; // HH:MM
  status: "sent" | "delivered" | "read";
  attachment?: {
    type: "video" | "audio" | "pdf" | "photo";
    name: string;
    url?: string;
    size?: string;
    duration?: string;
  };
}

interface ChatViewProps {
  students: Student[];
}

export default function ChatView({ students }: ChatViewProps) {
  const [activeStudentId, setActiveStudentId] = useState<string>(students[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [copilotCategory, setCopilotCategory] = useState<"motivation" | "correction" | "recovery" | "congrats">("motivation");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const quickReplies = [
    "Excelente treino de hoje! Mantenha esse foco e consistência. 💪",
    "Lembre-se de registrar as cargas e a percepção de esforço (RPE) no seu app. 📝",
    "Se a dor persistir, pare imediatamente e me avise. Vamos cuidar dessas articulações! ⚠️",
    "Vídeo com a correção postural enviado. Dê uma olhada antes do próximo treino! 📹"
  ];

  const generateCopilotText = (category: "motivation" | "correction" | "recovery" | "congrats") => {
    const studentName = activeStudent?.name || "Campeão";
    const phase = activeStudent?.currentPhase || "Hipertrofia";
    
    const templates = {
      motivation: [
        `Fala ${studentName}! Vi seu progresso na fase de ${phase}. A constância é a chave para a supercompensação muscular. Mantenha os treinos em alta intensidade esta semana! 🚀`,
        `Opa ${studentName}! Excelente evolução nos registros. Cada treino conta para consolidar seu volume semanal adaptativo. Vamos buscar o próximo nível! 🔥`
      ],
      correction: [
        `Fala ${studentName}! Vi seus comentários sobre o agachamento. Vamos focar na cadência da descida (fase excêntrica em 4 segundos) para melhorar a estabilidade patelar e poupar os joelhos. 📐`,
        `Opa ${studentName}! Notei que as repetições estão próximas ao limite. Lembre-se de manter as escápulas aduzidas e os cotovelos alinhados sob a barra no supino. 🏋️‍♂️`
      ],
      recovery: [
        `Fala ${studentName}! Como está a recuperação muscular hoje? Se a fadiga residual estiver muito alta, podemos reduzir o volume de trabalho direto e focar em séries regenerativas. 💤`,
        `Opa ${studentName}! Lembre-se de que o descanso e a síntese proteica via mTOR andam juntos. Garanta uma boa noite de sono e a hidratação recomendada para regenerar as fibras. 💧`
      ],
      congrats: [
        `Parabéns pelo foco, ${studentName}! Sua frequência semanal está excelente e você já subiu de nível na nossa Arena TreinoPro! Continue liderando o ranking! 🏆`,
        `Sensacional, ${studentName}! Bateu a meta de treinos com maestria esta semana. Conquista merecida e pontos extras computados no seu perfil! 🥇`
      ]
    };
    
    const list = templates[category];
    const randomTemplate = list[Math.floor(Math.random() * list.length)];
    setInputText(randomTemplate);
    setShowCopilot(false);
  };

  // Pre-seeded chat messages per student
  const defaultHistories: Record<string, Message[]> = {
    "stud-seeded-gustavo": [
      {
        id: "m-g-1",
        sender: "student",
        text: "Professor, fiz o treino de ontem e senti um incômodo leve no joelho esquerdo ao fazer o agachamento livre na terceira série. Devo diminuir a carga?",
        timestamp: "08:14",
        status: "read"
      },
      {
        id: "m-g-2",
        sender: "coach",
        text: "Opa Gustavo! Vamos monitorar isso de perto. Pare imediatamente se a dor passar de grau 3 de 10. No próximo treino, reduza a carga em 20% e concentre-se na amplitude e no controle da descida (fase excêntrica em 4 segundos). Vou te mandar o vídeo com o ajuste de postura.",
        timestamp: "08:30",
        status: "read"
      },
      {
        id: "m-g-3",
        sender: "coach",
        text: "Dá uma olhada nesse educativo de mobilidade de tornozelo para fazermos antes do agachamento.",
        timestamp: "08:32",
        status: "read",
        attachment: {
          type: "video",
          name: "Mobilidade_Tornozelo_Agachamento.mp4",
          size: "14.2 MB",
          duration: "1:24"
        }
      },
      {
        id: "m-g-4",
        sender: "student",
        text: "Perfeito, vou fazer hoje mesmo antes de treinar e te aviso se melhorou!",
        timestamp: "09:05",
        status: "read"
      }
    ],
    "stud-seeded-camila": [
      {
        id: "m-c-1",
        sender: "student",
        text: "Bom dia, Coach! Acabei de enviar as fotos de evolução de julho no painel. Consegui manter a constância 100% essa semana!",
        timestamp: "07:30",
        status: "read"
      },
      {
        id: "m-c-2",
        sender: "coach",
        text: "Excelente Camila! Seus resultados estão incríveis, a definição abdominal e a melhora na postura são nítidas nas fotos de perfil. Parabéns pelo foco!",
        timestamp: "08:00",
        status: "read"
      },
      {
        id: "m-c-3",
        sender: "coach",
        text: "Aqui está o PDF com o feedback detalhado do seu laudo postural e dobras corporais atualizado.",
        timestamp: "08:05",
        status: "read",
        attachment: {
          type: "pdf",
          name: "Laudo_Evolucao_Postural_Camila.pdf",
          size: "2.4 MB"
        }
      },
      {
        id: "m-c-4",
        sender: "student",
        text: "Nossa, adorei a análise! Muito obrigada pela dedicação. Vou continuar firme 💪",
        timestamp: "08:15",
        status: "read"
      }
    ],
    "stud-seeded-ricardo": [
      {
        id: "m-r-1",
        sender: "student",
        text: "Professor, estou achando que o volume de peito está muito alto. Fiquei muito fadigado no treino de ontem e não consegui manter as cargas no supino reto.",
        timestamp: "Ontem",
        status: "read"
      },
      {
        id: "m-r-2",
        sender: "coach",
        text: "Ricardo, você está saindo de um bloco de alta intensidade e entrando no pico de volume (mesociclo de 24 séries). É normal sentir esse acúmulo de fadiga periférica, mas precisamos ajustar para não virar Junk Volume. Vou aplicar a técnica Rest-Pause para reduzir a carga axial, mantendo a tensão mecânica alta.",
        timestamp: "Ontem",
        status: "read"
      },
      {
        id: "m-r-3",
        sender: "student",
        text: "Legal, acho que vai ajudar bastante. Sinto que as articulações estão pedindo um descanso.",
        timestamp: "09:40",
        status: "read"
      }
    ]
  };

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem("treinopro_chat_histories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultHistories;
  });

  // Save to localStorage on change and listen to external updates
  useEffect(() => {
    localStorage.setItem("treinopro_chat_histories", JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "treinopro_chat_histories" && e.newValue) {
        try {
          setChatHistories(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Automatically scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, activeStudentId]);

  const activeStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Handle Send Message
  const handleSendMessage = (textToSend?: string, attachmentToSend?: Message["attachment"]) => {
    const finalTxt = textToSend || inputText;
    if (!finalTxt.trim() && !attachmentToSend) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "coach",
      text: finalTxt,
      timestamp: timeStr,
      status: "sent",
      attachment: attachmentToSend
    };

    setChatHistories(prev => ({
      ...prev,
      [activeStudentId]: [...(prev[activeStudentId] || []), newMsg]
    }));

    if (!textToSend) {
      setInputText("");
    }
    setShowAttachmentMenu(false);

    // Simulate student read indicator and automatic simulated reply after 2 seconds
    setTimeout(() => {
      setChatHistories(prev => {
        const list = prev[activeStudentId] || [];
        return {
          ...prev,
          [activeStudentId]: list.map(m => m.id === newMsg.id ? { ...m, status: "read" } : m)
        };
      });

      // Simulate student typing a friendly reply
      setTimeout(() => {
        const studentResponses = [
          "Opa, perfeito! Entendido.",
          "Muito obrigado pelo retorno, Coach! Vou seguir essa orientação.",
          "Maravilha, vou registrar na minha ficha de treino hoje à noite.",
          "Entendi. Carga ajustada!",
          "Fechado! Obrigado pelo suporte de sempre."
        ];
        const randomResp = studentResponses[Math.floor(Math.random() * studentResponses.length)];
        
        const autoMsg: Message = {
          id: `m-${Date.now() + 1}`,
          sender: "student",
          text: randomResp,
          timestamp: timeStr,
          status: "read"
        };

        setChatHistories(prev => ({
          ...prev,
          [activeStudentId]: [...(prev[activeStudentId] || []), autoMsg]
        }));
      }, 1500);

    }, 1000);
  };

  // Preset file templates to mock attachments
  const triggerAttachment = (type: "video" | "audio" | "pdf" | "photo") => {
    let attachment: Message["attachment"];

    if (type === "video") {
      attachment = {
        type: "video",
        name: "Execucao_Correta_Supino_Halteres.mp4",
        size: "18.5 MB",
        duration: "0:45"
      };
    } else if (type === "audio") {
      attachment = {
        type: "audio",
        name: "Orientacao_Cardio_Pos_Treino.mp3",
        size: "3.1 MB",
        duration: "2:10"
      };
    } else if (type === "pdf") {
      attachment = {
        type: "pdf",
        name: "Ficha_Treino_Completo_A_B_C.pdf",
        size: "1.2 MB"
      };
    } else {
      attachment = {
        type: "photo",
        name: "Evolucao_Costas_Simetria.jpg",
        size: "4.8 MB"
      };
    }

    handleSendMessage(`Enviei um arquivo para você: ${attachment.name}`, attachment);
  };

  const activeMessages = useMemo(() => {
    return chatHistories[activeStudentId] || [];
  }, [chatHistories, activeStudentId]);

  return (
    <div className="h-[80vh] flex rounded-2xl overflow-hidden border border-white/5 bg-[#141517] animate-fadeIn">
      
      {/* Left Pane: Student Chat list */}
      <div className="w-80 border-r border-[#3a494b]/20 flex flex-col bg-[#111214]">
        {/* Search Bar */}
        <div className="p-4 border-b border-[#3a494b]/20">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb]/60 group-focus-within:text-[#00f2ff] transition-colors" />
            <input
              type="text"
              placeholder="Procurar aluno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b1c1e] pl-9 pr-3 py-2.5 rounded-xl border border-white/5 text-xs font-mono outline-none focus:border-[#00f2ff]/40 transition-all placeholder-white/20 uppercase tracking-wider text-white"
            />
          </div>
        </div>

        {/* Student items */}
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map(student => {
            const lastMsgs = chatHistories[student.id] || [];
            const lastMsg = lastMsgs[lastMsgs.length - 1];
            const isSelected = student.id === activeStudentId;

            return (
              <div
                key={student.id}
                onClick={() => setActiveStudentId(student.id)}
                className={`p-4 border-b border-[#3a494b]/10 cursor-pointer transition-all flex items-center gap-3 relative ${
                  isSelected 
                    ? "bg-[#00f2ff]/5 border-r-4 border-r-[#00f2ff]" 
                    : "hover:bg-white/[0.01]"
                }`}
              >
                {/* Status Indicator Dot */}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-2 top-4 border-2 border-[#111214]" />
                
                {/* Avatar with custom color */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${student.avatarColor}`}>
                  {student.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`font-bold text-xs truncate ${isSelected ? "text-[#00f2ff]" : "text-[#e3e2e4]"}`}>
                      {student.name}
                    </h4>
                    <span className="text-[9px] font-mono text-[#b9cacb]/50">
                      {lastMsg ? lastMsg.timestamp : "08:00"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#b9cacb]/70 truncate uppercase tracking-wider">
                    {student.currentPhase}
                  </p>
                  <p className="text-[10px] text-[#b9cacb]/50 truncate mt-1">
                    {lastMsg ? (
                      lastMsg.sender === "coach" ? `Você: ${lastMsg.text}` : lastMsg.text
                    ) : "Inicie uma conversa..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Conversation Area */}
      <div className="flex-1 flex flex-col bg-[#17181a]/95">
        {/* Header */}
        {activeStudent && (
          <div className="p-4 border-b border-[#3a494b]/20 bg-[#111214] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${activeStudent.avatarColor}`}>
                {activeStudent.initials}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{activeStudent.name}</h3>
                <p className="text-[10px] text-[#00f2ff] font-mono uppercase tracking-wider">
                  Fase: {activeStudent.currentPhase} | Plano: {activeStudent.plan}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#00f2ff]/10 text-[#00dbe7] border border-[#00f2ff]/20 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3 h-3 text-[#00f2ff]" />
                Canais de Atendimento
              </span>
            </div>
          </div>
        )}

        {/* Message bubble thread list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="text-center">
            <span className="text-[9px] font-mono text-[#b9cacb]/40 uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
              Canal de Atendimento Privado Criptografado
            </span>
          </div>

          {activeMessages.map(msg => {
            const isCoach = msg.sender === "coach";
            
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${isCoach ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  isCoach ? "bg-[#343537] border border-white/10 text-white" : activeStudent.avatarColor
                }`}>
                  {isCoach ? "PF" : activeStudent.initials}
                </div>

                <div className="space-y-1">
                  {/* Bubble */}
                  <div className={`p-3.5 rounded-2xl relative shadow-md ${
                    isCoach
                      ? "bg-[#00f2ff]/10 border border-[#00f2ff]/20 rounded-tr-none text-[#e3e2e4]"
                      : "bg-[#111214] border border-white/5 rounded-tl-none text-[#e3e2e4]"
                  }`}>
                    <p className="text-[11px] leading-relaxed font-sans font-medium whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Render attachment block if exists */}
                    {msg.attachment && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#0a0b0d]/80 border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1c1d1f] flex items-center justify-center border border-white/5">
                          {msg.attachment.type === "video" && <Video className="w-4 h-4 text-[#00f2ff]" />}
                          {msg.attachment.type === "audio" && <Music className="w-4 h-4 text-emerald-400" />}
                          {msg.attachment.type === "pdf" && <FileText className="w-4 h-4 text-red-400" />}
                          {msg.attachment.type === "photo" && <ImageIcon className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className="min-w-0 flex-1 font-mono text-[10px]">
                          <p className="font-bold text-white truncate">{msg.attachment.name}</p>
                          <p className="text-[#b9cacb]/60">
                            {msg.attachment.size} {msg.attachment.duration && `| Duração: ${msg.attachment.duration}`}
                          </p>
                        </div>
                        <button
                          className="bg-[#1c1d1f] hover:bg-[#252629] border border-white/5 text-white text-[9px] px-2.5 py-1 rounded-lg font-bold"
                          onClick={() => alert(`Baixando arquivo ${msg.attachment?.name}...`)}
                        >
                          ABRIR
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Meta (time & status) */}
                  <div className={`flex items-center gap-1.5 text-[9px] font-mono text-[#b9cacb]/40 ${isCoach ? "justify-end" : "justify-start"}`}>
                    <span>{msg.timestamp}</span>
                    {isCoach && (
                      <span>
                        {msg.status === "read" ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#00f2ff]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Action input bar */}
        <div className="p-4 border-t border-[#3a494b]/20 bg-[#111214] space-y-3.5 relative">
          
          {/* Quick Replies row */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-[#b9cacb]/40 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Respostas Rápidas
              </span>
              <button 
                type="button"
                onClick={() => setShowCopilot(!showCopilot)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  showCopilot 
                    ? "bg-purple-500/10 border-purple-400 text-purple-400" 
                    : "bg-[#1b1c1e] border-white/5 text-[#ebb2ff] hover:border-[#ebb2ff]/30"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#ebb2ff] animate-pulse" />
                TreinoPro Copilot (IA)
              </button>
            </div>

            {/* Quick replies slider */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(reply)}
                  className="px-3 py-1.5 rounded-lg bg-[#1b1c1e] hover:bg-[#252629] border border-white/5 text-[#b9cacb] hover:text-white font-sans text-[10px] whitespace-nowrap transition-all cursor-pointer shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* TreinoPro Copilot Assistant Box */}
          {showCopilot && (
            <div className="bg-[#1b1c1e] border border-purple-500/20 rounded-xl p-3 space-y-2.5 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerador de Mensagem Inteligente
                </span>
                <button 
                  type="button"
                  onClick={() => setShowCopilot(false)} 
                  className="text-gray-500 hover:text-white font-mono text-[9px] uppercase font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[9px] font-bold uppercase">
                <button
                  type="button"
                  onClick={() => generateCopilotText("motivation")}
                  className="p-2 rounded-lg bg-[#121315] hover:bg-purple-950/20 border border-white/5 text-purple-300 hover:border-purple-400/40 text-center transition-all cursor-pointer"
                >
                  🚀 Motivação
                </button>
                <button
                  type="button"
                  onClick={() => generateCopilotText("correction")}
                  className="p-2 rounded-lg bg-[#121315] hover:bg-cyan-950/20 border border-white/5 text-cyan-300 hover:border-cyan-400/40 text-center transition-all cursor-pointer"
                >
                  📐 Correção
                </button>
                <button
                  type="button"
                  onClick={() => generateCopilotText("recovery")}
                  className="p-2 rounded-lg bg-[#121315] hover:bg-emerald-950/20 border border-white/5 text-emerald-300 hover:border-emerald-400/40 text-center transition-all cursor-pointer"
                >
                  💧 Recuperação
                </button>
                <button
                  type="button"
                  onClick={() => generateCopilotText("congrats")}
                  className="p-2 rounded-lg bg-[#121315] hover:bg-amber-950/20 border border-white/5 text-amber-300 hover:border-amber-400/40 text-center transition-all cursor-pointer"
                >
                  🏆 Parabéns
                </button>
              </div>
            </div>
          )}

          {/* Attachment Selector overlay */}
          {showAttachmentMenu && (
            <div className="absolute bottom-20 left-4 bg-[#1b1c1e] border border-white/5 rounded-xl shadow-2xl p-2.5 grid grid-cols-4 gap-2 z-20">
              <button
                onClick={() => triggerAttachment("video")}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-white/[0.03] text-gray-300 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer"
              >
                <Video className="w-5 h-5 text-[#00f2ff] mb-1" />
                Vídeo
              </button>
              <button
                onClick={() => triggerAttachment("audio")}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-white/[0.03] text-gray-300 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer"
              >
                <Music className="w-5 h-5 text-emerald-400 mb-1" />
                Áudio
              </button>
              <button
                onClick={() => triggerAttachment("pdf")}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-white/[0.03] text-gray-300 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5 text-red-400 mb-1" />
                PDF
              </button>
              <button
                onClick={() => triggerAttachment("photo")}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-white/[0.03] text-gray-300 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 text-purple-400 mb-1" />
                Foto
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-3 rounded-xl bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-white/5 transition-all cursor-pointer hover:bg-white/[0.02]"
              title="Anexar arquivos de mídia"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex gap-2"
            >
              <input
                type="text"
                placeholder="Escreva uma mensagem..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 bg-[#1b1c1e] px-4 py-3 rounded-xl border border-white/5 text-xs text-white focus:outline-none focus:border-[#00f2ff]/40 transition-all placeholder-white/25 font-sans"
              />

              <button
                type="submit"
                className="p-3 bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff] hover:text-black rounded-xl border border-[#00f2ff]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
