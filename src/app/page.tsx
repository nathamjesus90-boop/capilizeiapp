"use client";

import { useState, useRef } from "react";
import { Camera, Sparkles, CheckCircle, Mail, ArrowRight, ArrowLeft } from "lucide-react";
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
        titulo: "Seu cabelo apresenta sinais de ressecamento e perda de brilho.",
        recomendacao: "Indicamos foco em hidratação e nutrição profunda no seu cronograma.",
      };
    } else if (estadoFios === "quebradiços" || dificuldades.includes("pontas")) {
      return {
        titulo: "Seus fios estão fragilizados e precisam de reconstrução.",
        recomendacao: "Recomendamos tratamento com proteínas e queratina para fortalecer a fibra capilar.",
      };
    } else if (dificuldades.includes("frizz")) {
      return {
        titulo: "Seu cabelo apresenta frizz e falta de alinhamento.",
        recomendacao: "Indicamos tratamentos de alinhamento e selagem de cutículas para controle do volume.",
      };
    } else {
      return {
        titulo: "Seu cabelo está em bom estado, mas pode melhorar ainda mais!",
        recomendacao: "Recomendamos um cronograma de manutenção para manter a saúde e o brilho dos fios.",
      };
    }
  };

  // TELA INICIAL
  if (step === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-12 h-12 text-amber-400" />
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                Capilize<span className="text-amber-400">IA</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-xl mx-auto leading-relaxed">
              Descubra o tratamento ideal para o seu cabelo com tecnologia e cuidado profissional.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <p className="text-lg text-blue-50 mb-6">
              Entenda o que seu cabelo realmente precisa e comece seu tratamento de forma inteligente.
            </p>
            <Button
              onClick={() => setStep("quiz")}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105"
            >
              Iniciar Diagnóstico
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-400" />
              <span>100% Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-400" />
              <span>Resultado em minutos</span>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">CapilizeIA</h2>
            </div>
            <p className="text-blue-200">
              Pergunta {currentQuestion + 1} de {questions.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-2xl font-semibold text-slate-800">
              {currentQ.question}
            </h3>

            <RadioGroup value={currentAnswer} onValueChange={handleQuizAnswer}>
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-teal-500 ${
                      currentAnswer === option.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 bg-white"
                    }`}
                    onClick={() => handleQuizAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer text-slate-700 font-medium"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePrevQuestion}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={!currentAnswer}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
              >
                Continuar
                <ArrowRight className="ml-2 w-4 h-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">CapilizeIA</h2>
            </div>
            <p className="text-blue-200">Última pergunta</p>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full w-full" />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-2xl font-semibold text-slate-800">
              Quais são suas principais dificuldades?
            </h3>
            <p className="text-slate-600">Selecione todas que se aplicam</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dificuldadesOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-teal-500 ${
                    quizAnswers.dificuldades.includes(option.value)
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDificuldadesToggle(option.value)}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      quizAnswers.dificuldades.includes(option.value)
                        ? "bg-teal-500 border-teal-500"
                        : "border-gray-300"
                    }`}
                  >
                    {quizAnswers.dificuldades.includes(option.value) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="flex-1 text-slate-700 font-medium">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setCurrentQuestion(questions.length - 1);
                  setStep("quiz");
                }}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={() => setStep("photo")}
                disabled={quizAnswers.dificuldades.length === 0}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                Continuar para análise
                <ArrowRight className="ml-2 w-4 h-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">CapilizeIA</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            {!photo && !isAnalyzing && (
              <>
                <Camera className="w-20 h-20 text-teal-500 mx-auto" />
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-slate-800">
                    Análise por foto
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Tire uma foto do seu cabelo com boa iluminação para gerar um
                    diagnóstico preciso.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  >
                    <Camera className="mr-2 w-5 h-5" />
                    Tirar Foto
                  </Button>
                  <Button
                    onClick={() => setStep("quiz-dificuldades")}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Voltar
                  </Button>
                </div>
              </>
            )}

            {isAnalyzing && (
              <div className="py-12 space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-teal-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-800">
                    Analisando seu cabelo...
                  </h3>
                  <p className="text-slate-600">
                    Avaliando textura, brilho e saúde dos fios
                  </p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">CapilizeIA</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                Diagnóstico Completo
              </h3>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 space-y-4">
              <p className="text-lg text-slate-800 font-semibold leading-relaxed">
                {diagnostico.titulo}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {diagnostico.recomendacao}
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="text-slate-800 font-semibold">
                    Receba o cronograma completo no seu e-mail
                  </p>
                  <p className="text-slate-600 text-sm">
                    Gratuito e personalizado para o seu tipo de cabelo
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("email")}
              size="lg"
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            >
              Receber meu cronograma
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // COLETA DE EMAIL
  if (step === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">CapilizeIA</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <Mail className="w-16 h-16 text-teal-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-800">
                Quase lá!
              </h3>
              <p className="text-slate-600">
                Digite seu e-mail para receber o cronograma capilar personalizado
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Seu melhor e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleSubmitEmail}
                  disabled={!email || isSending}
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Receber cronograma
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setStep("result")}
                  variant="outline"
                  className="w-full"
                  disabled={isSending}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Seus dados estão seguros e não serão compartilhados com terceiros
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SUCESSO
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800">
                Pronto! 🎉
              </h3>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 space-y-3">
              <p className="text-lg text-slate-800 font-semibold">
                Em até 30 minutos, seu cronograma capilar personalizado chegará no
                seu e-mail.
              </p>
              <p className="text-slate-600">
                Verifique sua caixa de entrada e também a pasta de spam.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-slate-700 font-medium">
                Enviamos para: <span className="text-teal-600">{email}</span>
              </p>
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
                className="w-full"
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
