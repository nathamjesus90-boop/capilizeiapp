"use client";

import { useState, useRef } from "react";
import { Camera, Sparkles, CheckCircle, Mail, ArrowRight, ArrowLeft, Zap, Shield, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Step = "home" | "quiz" | "photo" | "result" | "email" | "success";

interface QuizAnswers {
  oleosidade: string;
  quimica: string;
  estadoFios: string;
  dificuldades: string[];
}

export default function CapilizeIA() {
  const [step, setStep] = useState<Step>("home");
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    oleosidade: "",
    quimica: "",
    estadoFios: "",
    dificuldades: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questions = [
    {
      id: "oleosidade",
      question: "Como você descreveria a oleosidade do seu couro cabeludo?",
      options: [
        { value: "muito-oleoso", label: "Muito oleoso (lavo diariamente)" },
        { value: "oleoso", label: "Oleoso (lavo a cada 2 dias)" },
        { value: "normal", label: "Normal (lavo 2-3x por semana)" },
        { value: "seco", label: "Seco (raramente fica oleoso)" },
      ],
    },
    {
      id: "quimica",
      question: "Qual é a frequência de químicas ou coloração?",
      options: [
        { value: "frequente", label: "Frequente (a cada 1-2 meses)" },
        { value: "ocasional", label: "Ocasional (a cada 3-6 meses)" },
        { value: "raro", label: "Raro (1x por ano ou menos)" },
        { value: "nunca", label: "Nunca fiz química" },
      ],
    },
    {
      id: "estadoFios",
      question: "Como estão os fios atualmente?",
      options: [
        { value: "saudaveis", label: "Saudáveis e brilhantes" },
        { value: "ressecados", label: "Ressecados e opacos" },
        { value: "quebradiços", label: "Quebradiços e frágeis" },
        { value: "mistos", label: "Raiz oleosa e pontas secas" },
      ],
    },
  ];

  const dificuldadesOptions = [
    { value: "frizz", label: "Frizz e volume excessivo" },
    { value: "queda", label: "Queda de cabelo" },
    { value: "pontas", label: "Pontas duplas" },
    { value: "ressecamento", label: "Ressecamento" },
    { value: "oleosidade", label: "Oleosidade excessiva" },
    { value: "caspa", label: "Caspa ou coceira" },
  ];

  const handleQuizAnswer = (value: string) => {
    const currentQ = questions[currentQuestion];
    setQuizAnswers({ ...quizAnswers, [currentQ.id]: value });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep("quiz-dificuldades");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setStep("home");
    }
  };

  const handleDificuldadesToggle = (value: string) => {
    const current = quizAnswers.dificuldades;
    if (current.includes(value)) {
      setQuizAnswers({
        ...quizAnswers,
        dificuldades: current.filter((d) => d !== value),
      });
    } else {
      setQuizAnswers({
        ...quizAnswers,
        dificuldades: [...current, value],
      });
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setIsAnalyzing(true);
        // Simula análise de 3 segundos
        setTimeout(() => {
          setIsAnalyzing(false);
          setStep("result");
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEmail = async () => {
    if (!email) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/send-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          quizAnswers,
          photo,
        }),
      });

      if (response.ok) {
        setStep("success");
      } else {
        alert("Erro ao enviar. Tente novamente.");
      }
    } catch (error) {
      alert("Erro ao enviar. Verifique sua conexão.");
    } finally {
      setIsSending(false);
    }
  };

  const getDiagnostico = () => {
    const { estadoFios, dificuldades } = quizAnswers;
    
    if (estadoFios === "ressecados" || dificuldades.includes("ressecamento")) {
      return {
        titulo: "ALERTA: Seus fios estão em estado crítico de desidratação!",
        recomendacao: "Você está a POUCOS DIAS de danos irreversíveis. Seu cronograma personalizado vai REVERTER isso antes que seja tarde demais.",
        urgencia: "🔴 CRÍTICO",
      };
    } else if (estadoFios === "quebradiços" || dificuldades.includes("pontas")) {
      return {
        titulo: "ATENÇÃO: Seus fios estão quebrando AGORA enquanto você lê isso!",
        recomendacao: "A cada dia sem tratamento adequado, você perde CENTÍMETROS de cabelo. Seu cronograma vai PARAR essa destruição imediatamente.",
        urgencia: "🟠 URGENTE",
      };
    } else if (dificuldades.includes("frizz")) {
      return {
        titulo: "Você está PERDENDO oportunidades por causa do frizz!",
        recomendacao: "Imagine acordar com cabelo de salão TODOS OS DIAS. Seu cronograma vai transformar isso em realidade em 14 dias.",
        urgencia: "🟡 AÇÃO NECESSÁRIA",
      };
    } else {
      return {
        titulo: "Seu cabelo está BOM... mas poderia estar PERFEITO!",
        recomendacao: "Você está a UM PASSO de ter o cabelo dos seus sonhos. Não deixe essa oportunidade passar.",
        urgencia: "🟢 OPORTUNIDADE",
      };
    }
  };

  // TELA INICIAL
  if (step === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="max-w-4xl w-full text-center space-y-10 relative z-10">
          {/* Badge de urgência */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm animate-bounce shadow-2xl shadow-red-500/50">
            <Zap className="w-4 h-4" />
            <span>APENAS HOJE: Diagnóstico 100% GRATUITO</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-amber-400/50"></div>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 drop-shadow-2xl">
                Capilize<span className="text-white">IA</span>
              </h1>
            </div>
            
            <p className="text-2xl md:text-4xl font-bold text-white max-w-3xl mx-auto leading-tight drop-shadow-lg">
              PARE de gastar R$ 500+ em tratamentos que <span className="text-red-500 underline decoration-wavy">NÃO FUNCIONAM</span>
            </p>
            
            <p className="text-xl md:text-2xl text-amber-100 max-w-2xl mx-auto leading-relaxed font-medium">
              Descubra em <span className="text-amber-400 font-bold">3 minutos</span> o que está DESTRUINDO seu cabelo e como reverter isso <span className="text-green-400 font-bold">HOJE</span>
            </p>
          </div>

          {/* Card principal */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-amber-400/30 shadow-2xl shadow-amber-500/20">
            {/* Prova social */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">+12.847</p>
                <p className="text-sm text-gray-300">Cabelos transformados</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Clock className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">3 min</p>
                <p className="text-sm text-gray-300">Diagnóstico completo</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Shield className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">97%</p>
                <p className="text-sm text-gray-300">Taxa de satisfação</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl p-6">
                <p className="text-lg md:text-xl text-white font-bold mb-2">
                  ⚠️ ATENÇÃO: Cada dia sem tratamento adequado = DANOS PERMANENTES
                </p>
                <p className="text-gray-200">
                  Não deixe seu cabelo sofrer mais um dia. Descubra AGORA o que ele precisa.
                </p>
              </div>

              <Button
                onClick={() => setStep("quiz")}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 text-black font-black text-xl md:text-2xl px-12 py-8 rounded-2xl shadow-2xl shadow-amber-500/50 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/70 border-4 border-amber-300"
              >
                <Zap className="mr-3 w-7 h-7" />
                COMEÇAR DIAGNÓSTICO GRATUITO AGORA
                <ArrowRight className="ml-3 w-7 h-7" />
              </Button>

              <p className="text-sm text-gray-400 italic">
                ⏰ Mais de <span className="text-amber-400 font-bold">247 pessoas</span> fizeram o diagnóstico nas últimas 24h
              </p>
            </div>
          </div>

          {/* Garantias */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold">100% Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Sem cadastro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Resultado instantâneo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Dados 100% seguros</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ - PERGUNTAS 1-3
  if (step === "quiz") {
    const currentQ = questions[currentQuestion];
    const currentAnswer = quizAnswers[currentQ.id as keyof QuizAnswers] as string;
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-10 h-10 text-amber-400" />
              <h2 className="text-4xl font-black text-white">CapilizeIA</h2>
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 text-amber-300 px-4 py-2 rounded-full font-bold text-sm">
              Pergunta {currentQuestion + 1} de {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 h-full transition-all duration-500 shadow-lg shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-amber-400/30 space-y-8">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              {currentQ.question}
            </h3>

            <RadioGroup value={currentAnswer} onValueChange={handleQuizAnswer}>
              <div className="space-y-4">
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-4 p-5 rounded-2xl border-3 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
                      currentAnswer === option.value
                        ? "border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg shadow-amber-500/30"
                        : "border-gray-300 bg-white hover:border-amber-400"
                    }`}
                    onClick={() => handleQuizAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="w-6 h-6" />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer text-gray-800 font-bold text-lg"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handlePrevQuestion}
                variant="outline"
                className="flex-1 h-14 text-lg font-bold border-2 hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Voltar
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={!currentAnswer}
                className="flex-1 h-14 text-lg font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ - DIFICULDADES (PERGUNTA 4)
  if (step === "quiz-dificuldades") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-10 h-10 text-amber-400" />
              <h2 className="text-4xl font-black text-white">CapilizeIA</h2>
            </div>
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-full font-bold text-sm animate-pulse">
              🔥 ÚLTIMA PERGUNTA - Quase lá!
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full w-full shadow-lg shadow-amber-500/50" />
          </div>

          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-amber-400/30 space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                Quais problemas estão DESTRUINDO seu cabelo AGORA?
              </h3>
              <p className="text-lg text-gray-700 font-semibold">
                Selecione TODOS que você enfrenta (quanto mais informações, melhor o diagnóstico)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dificuldadesOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-5 rounded-2xl border-3 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
                    quizAnswers.dificuldades.includes(option.value)
                      ? "border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg shadow-amber-500/30"
                      : "border-gray-300 bg-white hover:border-amber-400"
                  }`}
                  onClick={() => handleDificuldadesToggle(option.value)}
                >
                  <div
                    className={`w-7 h-7 rounded-lg border-3 flex items-center justify-center transition-all ${
                      quizAnswers.dificuldades.includes(option.value)
                        ? "bg-amber-500 border-amber-600 shadow-lg"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {quizAnswers.dificuldades.includes(option.value) && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="flex-1 text-gray-800 font-bold text-lg">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => {
                  setCurrentQuestion(questions.length - 1);
                  setStep("quiz");
                }}
                variant="outline"
                className="flex-1 h-14 text-lg font-bold border-2 hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Voltar
              </Button>
              <Button
                onClick={() => setStep("photo")}
                disabled={quizAnswers.dificuldades.length === 0}
                className="flex-1 h-14 text-lg font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg hover:shadow-xl"
              >
                VER MEU DIAGNÓSTICO
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CAPTURA DE FOTO
  if (step === "photo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-10 h-10 text-amber-400" />
              <h2 className="text-4xl font-black text-white">CapilizeIA</h2>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-amber-400/30 space-y-8 text-center">
            {!photo && !isAnalyzing && (
              <>
                <div className="relative inline-block">
                  <Camera className="w-24 h-24 text-amber-500 mx-auto" />
                  <div className="absolute inset-0 blur-2xl bg-amber-500/30"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900">
                    Análise Profissional por IA
                  </h3>
                  <p className="text-xl text-gray-700 font-bold max-w-2xl mx-auto">
                    Nossa IA vai analisar <span className="text-amber-600">textura, brilho, hidratação e danos</span> em segundos
                  </p>
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-gray-800 font-semibold">
                      💡 DICA: Tire a foto com boa iluminação natural para um diagnóstico mais preciso
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                <div className="space-y-4 pt-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="w-full h-16 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xl shadow-lg hover:shadow-xl"
                  >
                    <Camera className="mr-3 w-6 h-6" />
                    TIRAR FOTO E ANALISAR
                  </Button>
                  <Button
                    onClick={() => setStep("quiz-dificuldades")}
                    variant="outline"
                    className="w-full h-14 text-lg font-bold border-2"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                </div>
              </>
            )}

            {isAnalyzing && (
              <div className="py-12 space-y-8">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-gray-900">
                    Analisando seu cabelo...
                  </h3>
                  <p className="text-xl text-gray-700 font-bold">
                    Nossa IA está processando <span className="text-amber-600">milhares de dados</span> sobre seus fios
                  </p>
                  <div className="max-w-md mx-auto space-y-2 text-left">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Analisando textura e porosidade...</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
                      <span className="font-semibold">Detectando nível de hidratação...</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-500"></div>
                      <span className="font-semibold">Identificando danos e necessidades...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RESULTADO
  if (step === "result") {
    const diagnostico = getDiagnostico();

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-10 h-10 text-amber-400" />
              <h2 className="text-4xl font-black text-white">CapilizeIA</h2>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-amber-400/30 space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-black text-lg shadow-lg animate-pulse">
                {diagnostico.urgencia}
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                Diagnóstico Completo
              </h3>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-3 border-red-400 rounded-2xl p-8 space-y-5">
              <p className="text-2xl text-gray-900 font-black leading-tight">
                {diagnostico.titulo}
              </p>
              <p className="text-xl text-gray-800 font-bold leading-relaxed">
                {diagnostico.recomendacao}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-3 border-amber-400 rounded-2xl p-8 space-y-5 shadow-lg">
              <div className="flex items-start gap-4">
                <Mail className="w-10 h-10 text-amber-600 flex-shrink-0 mt-1" />
                <div className="space-y-3">
                  <p className="text-2xl text-gray-900 font-black">
                    🎁 RECEBA GRÁTIS: Cronograma Capilar Personalizado
                  </p>
                  <p className="text-lg text-gray-800 font-bold">
                    Passo a passo COMPLETO para transformar seu cabelo em 30 dias
                  </p>
                  <ul className="space-y-2 text-gray-700 font-semibold">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Produtos específicos para SEU tipo de cabelo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Frequência exata de cada tratamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Técnicas profissionais para aplicar em casa
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 text-center">
              <p className="text-lg text-red-900 font-black">
                ⚠️ ATENÇÃO: Não deixe para depois! Cada dia conta para a saúde dos seus fios.
              </p>
            </div>

            <Button
              onClick={() => setStep("email")}
              size="lg"
              className="w-full h-16 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Zap className="mr-3 w-6 h-6" />
              QUERO RECEBER MEU CRONOGRAMA GRÁTIS
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // COLETA DE EMAIL
  if (step === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-10 h-10 text-amber-400" />
              <h2 className="text-4xl font-black text-white">CapilizeIA</h2>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-amber-400/30 space-y-8">
            <div className="text-center space-y-4">
              <Mail className="w-20 h-20 text-amber-500 mx-auto" />
              <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-black text-lg shadow-lg animate-pulse">
                🎉 ÚLTIMO PASSO!
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900">
                Falta só o seu e-mail
              </h3>
              <p className="text-xl text-gray-700 font-bold">
                Vamos enviar seu cronograma personalizado em <span className="text-amber-600">menos de 30 minutos</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-900 font-black text-lg">
                  Digite seu melhor e-mail:
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-16 text-xl border-3 border-gray-300 focus:border-amber-500 rounded-xl font-semibold"
                />
              </div>

              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6">
                <p className="text-gray-800 font-bold text-center">
                  ✅ 100% seguro • ✅ Sem spam • ✅ Você pode cancelar quando quiser
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  onClick={handleSubmitEmail}
                  disabled={!email || isSending}
                  size="lg"
                  className="w-full h-16 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xl disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {isSending ? (
                    <>
                      <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin mr-3" />
                      ENVIANDO...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 w-6 h-6" />
                      RECEBER CRONOGRAMA AGORA
                      <ArrowRight className="ml-3 w-6 h-6" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setStep("result")}
                  variant="outline"
                  className="w-full h-14 text-lg font-bold border-2"
                  disabled={isSending}
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Voltar
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center font-semibold">
              🔒 Seus dados estão 100% seguros e protegidos
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SUCESSO
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-green-400/50 space-y-8 text-center">
            <div className="space-y-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-2xl shadow-green-500/50">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 blur-3xl bg-green-500/30"></div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-gray-900">
                PRONTO! 🎉
              </h3>
              <p className="text-2xl text-green-600 font-black">
                Seu cronograma está a caminho!
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-400 rounded-2xl p-8 space-y-5">
              <p className="text-2xl text-gray-900 font-black leading-tight">
                Em até 30 minutos você receberá:
              </p>
              <ul className="space-y-3 text-left max-w-xl mx-auto">
                <li className="flex items-start gap-3 text-lg text-gray-800 font-bold">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Seu diagnóstico completo e detalhado</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-gray-800 font-bold">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Cronograma capilar personalizado para 30 dias</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-gray-800 font-bold">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Lista de produtos recomendados para seu cabelo</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-gray-800 font-bold">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Dicas profissionais de aplicação</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6">
              <p className="text-xl text-gray-900 font-black mb-2">
                📧 Verifique sua caixa de entrada:
              </p>
              <p className="text-lg text-amber-700 font-bold">
                {email}
              </p>
              <p className="text-sm text-gray-600 font-semibold mt-3">
                💡 Não esqueça de verificar a pasta de SPAM/PROMOÇÕES
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400 rounded-2xl p-6">
                <p className="text-lg text-gray-900 font-black mb-2">
                  💜 Gostou do resultado?
                </p>
                <p className="text-gray-700 font-semibold">
                  Compartilhe com suas amigas que também querem transformar o cabelo!
                </p>
              </div>
              
              <Button
                onClick={() => {
                  setStep("home");
                  setQuizAnswers({
                    oleosidade: "",
                    quimica: "",
                    estadoFios: "",
                    dificuldades: [],
                  });
                  setCurrentQuestion(0);
                  setPhoto(null);
                  setEmail("");
                }}
                variant="outline"
                className="w-full h-14 text-lg font-bold border-2"
              >
                Fazer novo diagnóstico
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
