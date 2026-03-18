import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, CheckCircle2, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Question {
  id: string;
  question_text: string;
  category: string;
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/onboarding/questions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(response.data);
      } catch (err) {
        console.error('Erro ao buscar perguntas:', err);
        setError('Não foi possível carregar as perguntas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleNext = async () => {
    if (!answer.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const question = questions[currentIndex];
      
      await axios.post('/api/onboarding/answer', {
        questionId: question.id,
        answerContent: answer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer('');
      } else {
        setCompleted(true);
      }
    } catch (err) {
      console.error('Erro ao salvar resposta:', err);
      setError('Erro ao salvar sua resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark text-white text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md p-10"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-500/20 text-green-400">
              <CheckCircle2 size={64} />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Incrível!</h2>
          <p className="text-muted-foreground mb-8">
            Você deu o primeiro passo para mapear o seu universo de conexão. Suas respostas foram salvas com sucesso.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Voltar ao Dashboard
            <Sparkles size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
     return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark text-white text-center">
          <div className="glass-card max-w-md p-10">
            <p className="text-muted-foreground mb-4">Nenhuma pergunta encontrada.</p>
            <button onClick={() => navigate('/dashboard')} className="text-primary underline">Voltar</button>
          </div>
        </div>
     );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-white p-6 md:p-12">
      <header className="flex justify-between items-center mb-12 max-w-4xl mx-auto w-full">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex-1 max-w-xs mx-4">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary"
            />
          </div>
          <p className="text-[10px] text-center mt-2 text-muted-foreground uppercase tracking-widest font-bold">
            Progresso: {currentIndex + 1} de {questions.length}
          </p>
        </div>

        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card w-full max-w-2xl p-8 md:p-12 relative"
          >
            <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-4">
                {currentQuestion.category}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                {currentQuestion.question_text}
              </h2>
            </div>

            <textarea
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Sua resposta aqui..."
              className="w-full bg-surface-light border border-glass-border rounded-xl p-6 min-h-[150px] text-lg outline-none focus:border-primary transition-colors resize-none mb-8"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex justify-end">
              <button
                disabled={!answer.trim() || submitting}
                onClick={handleNext}
                className="btn-primary px-8 py-4 rounded-xl flex items-center gap-2 group disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : (currentIndex === questions.length - 1 ? 'Finalizar' : 'Próxima')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={14} className="text-primary" fill="currentColor" />
          <span>Mapa do Amor • Fase de Onboarding</span>
        </div>
        <p className="opacity-50">Respostas pílulas baseadas na ciência dos relacionamentos.</p>
      </footer>
    </div>
  );
};

export default OnboardingPage;
