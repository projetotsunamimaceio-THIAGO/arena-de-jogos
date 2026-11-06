/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FolderPlus,
  HelpCircle,
  Layers,
  X,
} from 'lucide-react';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';
import { ForcaWordItem, QuestionQuiz, QuestionVF, Theme } from '../../types/game';

export type ContentTab = 'vf' | 'quiz' | 'forca' | 'temas';

interface ContentManagerModalProps {
  initialTab?: ContentTab;
  onClose: () => void;
}

export const ContentManagerModal: React.FC<ContentManagerModalProps> = ({
  initialTab = 'vf',
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<ContentTab>(initialTab);
  const [themes, setThemes] = React.useState<Theme[]>(gameStateManager.getThemes());
  const [selectedThemeId, setSelectedThemeId] = React.useState<string>(themes[0]?.id || 'ciencias');

  // New Theme Input
  const [newThemeName, setNewThemeName] = React.useState('');

  // Questions state
  const [vfQuestions, setVfQuestions] = React.useState<QuestionVF[]>([]);
  const [quizQuestions, setQuizQuestions] = React.useState<QuestionQuiz[]>([]);
  const [forcaWords, setForcaWords] = React.useState<ForcaWordItem[]>([]);

  // Manual Question forms
  const [manualVF, setManualVF] = React.useState({ question: '', answer: true });
  const [manualQuiz, setManualQuiz] = React.useState({
    question: '',
    A: '',
    B: '',
    C: '',
    D: '',
    correct: 'A' as 'A' | 'B' | 'C' | 'D',
  });
  const [manualForca, setManualForca] = React.useState({
    word: '',
    category: '',
    hint1: '',
    hint2: '',
    extraHint: '',
  });

  // Status message
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError?: boolean } | null>(null);

  const refreshData = React.useCallback(() => {
    setThemes(gameStateManager.getThemes());
    setVfQuestions(gameStateManager.getVFQuestions(selectedThemeId));
    setQuizQuestions(gameStateManager.getQuizQuestions(selectedThemeId));
    setForcaWords(gameStateManager.getForcaWords());
  }, [selectedThemeId]);

  React.useEffect(() => {
    refreshData();
    const unsub = gameStateManager.subscribe(refreshData);
    return unsub;
  }, [refreshData]);

  const showStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- Handlers: Upload Excel VF ---
  const handleFileUploadVF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      const res = gameStateManager.parseVFExcel(buffer, selectedThemeId);
      if (res.success) {
        sounds.playSuccess();
        showStatus(`Sucesso! ${res.count} perguntas de V/F importadas para o tema selecionado.`);
        refreshData();
      } else {
        sounds.playError();
        showStatus(res.error || 'Erro ao importar planilha.', true);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // --- Handlers: Upload Excel Quiz ---
  const handleFileUploadQuiz = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      const res = gameStateManager.parseQuizExcel(buffer, selectedThemeId);
      if (res.success) {
        sounds.playSuccess();
        showStatus(`Sucesso! ${res.count} perguntas de Quiz importadas para o tema selecionado.`);
        refreshData();
      } else {
        sounds.playError();
        showStatus(res.error || 'Erro ao importar planilha.', true);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // --- Handlers: Upload Excel Forca ---
  const handleFileUploadForca = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      const res = gameStateManager.parseForcaExcel(buffer);
      if (res.success) {
        sounds.playSuccess();
        showStatus(`Sucesso! ${res.count} palavras importadas para o Jogo da Forca.`);
        refreshData();
      } else {
        sounds.playError();
        showStatus(res.error || 'Erro ao importar planilha da Forca.', true);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // --- Handlers: Manual Adds ---
  const handleAddManualVF = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVF.question.trim()) return;

    gameStateManager.saveVFQuestion({
      themeId: selectedThemeId,
      question: manualVF.question.trim(),
      answer: manualVF.answer,
    });
    sounds.playSuccess();
    setManualVF({ question: '', answer: true });
    showStatus('Pergunta Verdadeiro ou Falso adicionada!');
  };

  const handleAddManualQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuiz.question.trim() || !manualQuiz.A || !manualQuiz.B || !manualQuiz.C || !manualQuiz.D) {
      showStatus('Preencha a pergunta e todas as 4 alternativas!', true);
      return;
    }

    gameStateManager.saveQuizQuestion({
      themeId: selectedThemeId,
      question: manualQuiz.question.trim(),
      options: {
        A: manualQuiz.A.trim(),
        B: manualQuiz.B.trim(),
        C: manualQuiz.C.trim(),
        D: manualQuiz.D.trim(),
      },
      correct: manualQuiz.correct,
    });
    sounds.playSuccess();
    setManualQuiz({ question: '', A: '', B: '', C: '', D: '', correct: 'A' });
    showStatus('Pergunta do Quiz adicionada!');
  };

  const handleAddManualForca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForca.word.trim() || !manualForca.category.trim()) {
      showStatus('Preencha ao menos a palavra e a categoria!', true);
      return;
    }

    gameStateManager.saveForcaWord({
      word: manualForca.word.trim(),
      category: manualForca.category.trim(),
      hint1: manualForca.hint1.trim() || 'Sem dica cadastrada',
      hint2: manualForca.hint2.trim() || 'Sem dica cadastrada',
      extraHint: manualForca.extraHint.trim() || 'Dica extra não informada',
    });
    sounds.playSuccess();
    setManualForca({ word: '', category: '', hint1: '', hint2: '', extraHint: '' });
    showStatus('Palavra do Jogo da Forca adicionada!');
  };

  const handleAddTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName.trim()) return;
    const added = gameStateManager.addTheme(newThemeName.trim());
    setSelectedThemeId(added.id);
    setNewThemeName('');
    sounds.playSuccess();
    showStatus(`Tema "${added.name}" criado com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-['Lilita_One',sans-serif] text-xl md:text-2xl text-emerald-300 uppercase tracking-wide">
                GERENCIADOR DE CONTEÚDO E PLANILHAS
              </h2>
              <p className="text-xs text-slate-400">
                Importação via Excel (.xlsx) e cadastro com organização por Temas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/70 border-b border-slate-800 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('vf');
            }}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'vf'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            VERDADEIRO OU FALSO
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('quiz');
            }}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'quiz'
                ? 'bg-pink-500 text-white font-black shadow'
                : 'text-slate-400 hover:text-pink-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            QUIZ DO DIA
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('forca');
            }}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'forca'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            JOGO DA FORCA
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('temas');
            }}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'temas'
                ? 'bg-cyan-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            GERENCIAR TEMAS
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3 text-center text-xs font-bold transition-all ${
              statusMessage.isError ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Theme Selector Banner (shown for V/F and Quiz) */}
          {(activeTab === 'vf' || activeTab === 'quiz') && (
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">TEMA SELECIONADO:</span>
                <select
                  value={selectedThemeId}
                  onChange={(e) => setSelectedThemeId(e.target.value)}
                  className="bg-slate-800 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-300 outline-none"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-400">
                Mostrando perguntas vinculadas ao tema{' '}
                <strong className="text-emerald-300">
                  {themes.find((t) => t.id === selectedThemeId)?.name || 'Todos'}
                </strong>
              </div>
            </div>
          )}

          {/* TAB 1: VERDADEIRO OU FALSO */}
          {activeTab === 'vf' && (
            <div className="space-y-6">
              {/* Spreadsheet Actions Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Lilita_One',sans-serif] text-base text-emerald-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    IMPORTAR PLANILHA .XLSX (VERDADEIRO OU FALSO)
                  </h3>
                  <button
                    onClick={() => gameStateManager.downloadVFTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Modelo .xlsx
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Formato esperado: Colunas <strong>A = PERGUNTA</strong>, <strong>B = V</strong>,{' '}
                  <strong>C = F</strong>. Marque com <strong>"X"</strong> ou <strong>"V"</strong> a coluna correta.
                </p>

                <div className="pt-2">
                  <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-emerald-500/40 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/40 cursor-pointer transition text-xs font-bold text-emerald-300">
                    <Upload className="w-4 h-4" />
                    <span>Clique para carregar planilha .xlsx com as perguntas</span>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUploadVF} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Manual Entry Form */}
              <form onSubmit={handleAddManualVF} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-['Lilita_One',sans-serif] text-sm text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  CADASTRAR PERGUNTA MANUALMENTE
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Digite o enunciado da afirmação..."
                    value={manualVF.question}
                    onChange={(e) => setManualVF({ ...manualVF, question: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setManualVF({ ...manualVF, answer: true })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        manualVF.answer ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      VERDADEIRO
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualVF({ ...manualVF, answer: false })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        !manualVF.answer ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      FALSO
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 text-xs font-black shadow hover:brightness-110"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </form>

              {/* Question List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-400 uppercase">
                  Perguntas cadastradas ({vfQuestions.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {vfQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                    >
                      <div className="flex-1 pr-3">
                        <p className="text-slate-200">{q.question}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            q.answer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {q.answer ? 'VERDADEIRO' : 'FALSO'}
                        </span>
                        <button
                          onClick={() => {
                            gameStateManager.deleteVFQuestion(q.id);
                            refreshData();
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUIZ DO DIA */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              {/* Spreadsheet Actions Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-pink-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Lilita_One',sans-serif] text-base text-pink-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-pink-400" />
                    IMPORTAR PLANILHA .XLSX (QUIZ 4 ALTERNATIVAS)
                  </h3>
                  <button
                    onClick={() => gameStateManager.downloadQuizTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-pink-300 border border-pink-500/30 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Modelo .xlsx
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Formato esperado: Colunas <strong>PERGUNTA</strong>, <strong>A</strong>, <strong>B</strong>,{' '}
                  <strong>C</strong>, <strong>D</strong>, <strong>CORRETA</strong> (com A, B, C ou D).
                </p>

                <div className="pt-2">
                  <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-pink-500/40 rounded-2xl bg-pink-950/20 hover:bg-pink-950/40 cursor-pointer transition text-xs font-bold text-pink-300">
                    <Upload className="w-4 h-4" />
                    <span>Clique para carregar planilha .xlsx com as perguntas do Quiz</span>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUploadQuiz} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Manual Entry Form */}
              <form onSubmit={handleAddManualQuiz} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-['Lilita_One',sans-serif] text-sm text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-pink-400" />
                  CADASTRAR PERGUNTA MANUAL DO QUIZ
                </h3>

                <input
                  type="text"
                  placeholder="Enunciado da pergunta do quiz..."
                  value={manualQuiz.question}
                  onChange={(e) => setManualQuiz({ ...manualQuiz, question: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                    <div key={letter} className="flex items-center gap-1.5 bg-slate-900 px-2 py-1.5 rounded-xl border border-slate-700">
                      <span className="font-['Lilita_One',sans-serif] text-pink-400 text-xs w-4">
                        {letter}:
                      </span>
                      <input
                        type="text"
                        placeholder={`Alternativa ${letter}`}
                        value={manualQuiz[letter]}
                        onChange={(e) => setManualQuiz({ ...manualQuiz, [letter]: e.target.value })}
                        className="bg-transparent text-xs text-white outline-none flex-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">ALTERNATIVA CORRETA:</span>
                    <select
                      value={manualQuiz.correct}
                      onChange={(e) => setManualQuiz({ ...manualQuiz, correct: e.target.value as any })}
                      className="bg-slate-800 border border-pink-500 rounded-lg px-2 py-1 text-xs font-bold text-pink-400 outline-none"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-black shadow hover:brightness-110"
                  >
                    Salvar Pergunta
                  </button>
                </div>
              </form>

              {/* Quiz List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-400 uppercase">
                  Perguntas cadastradas ({quizQuestions.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {quizQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-slate-200 font-bold">{q.question}</p>
                        <button
                          onClick={() => {
                            gameStateManager.deleteQuizQuestion(q.id);
                            refreshData();
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                        <span className={q.correct === 'A' ? 'text-emerald-400 font-bold' : ''}>
                          A: {q.options.A}
                        </span>
                        <span className={q.correct === 'B' ? 'text-emerald-400 font-bold' : ''}>
                          B: {q.options.B}
                        </span>
                        <span className={q.correct === 'C' ? 'text-emerald-400 font-bold' : ''}>
                          C: {q.options.C}
                        </span>
                        <span className={q.correct === 'D' ? 'text-emerald-400 font-bold' : ''}>
                          D: {q.options.D}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JOGO DA FORCA */}
          {activeTab === 'forca' && (
            <div className="space-y-6">
              {/* Spreadsheet Actions Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-amber-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-['Lilita_One',sans-serif] text-base text-amber-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    IMPORTAR PLANILHA .XLSX (JOGO DA FORCA)
                  </h3>
                  <button
                    onClick={() => gameStateManager.downloadForcaTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Modelo .xlsx
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Formato esperado: Colunas <strong>A = PALAVRA</strong>, <strong>B = CATEGORIA</strong>,{' '}
                  <strong>C = DICA 1</strong>, <strong>D = DICA 2</strong>, <strong>E = DICA EXTRA</strong>.
                </p>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Lilita_One',sans-serif] text-xs uppercase tracking-wide cursor-pointer transition shadow">
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Arquivo .xlsx da Forca</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUploadForca}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500">Aceita arquivos .xlsx e .xls</span>
                </div>
              </div>

              {/* Manual Add Form */}
              <form onSubmit={handleAddManualForca} className="bg-slate-950/70 p-4 rounded-2xl border border-amber-500/40 space-y-3">
                <h3 className="font-['Lilita_One',sans-serif] text-base text-amber-300 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  OU INSERIR PALAVRA MANUALMENTE COM DICAS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">PALAVRA SECRETA</label>
                    <input
                      type="text"
                      placeholder="Ex: AMAZONIA"
                      value={manualForca.word}
                      onChange={(e) => setManualForca({ ...manualForca, word: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">CATEGORIA</label>
                    <input
                      type="text"
                      placeholder="Ex: Geografia / Biologia / Cinema"
                      value={manualForca.category}
                      onChange={(e) => setManualForca({ ...manualForca, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Dica 1 (Ex: Um país muito grande na América do Sul)"
                    value={manualForca.hint1}
                    onChange={(e) => setManualForca({ ...manualForca, hint1: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="Dica 2 (Ex: Tem a maior floresta tropical do mundo)"
                    value={manualForca.hint2}
                    onChange={(e) => setManualForca({ ...manualForca, hint2: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="Dica Extra (Ex: Conhecida como o pulmão do planeta)"
                    value={manualForca.extraHint}
                    onChange={(e) => setManualForca({ ...manualForca, extraHint: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-['Lilita_One',sans-serif] text-sm uppercase shadow hover:brightness-110 cursor-pointer"
                  >
                    Salvar Palavra
                  </button>
                </div>
              </form>

              {/* List of Forca Words */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-400 uppercase">
                  Banco de Palavras da Forca ({forcaWords.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                  {forcaWords.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-['Lilita_One',sans-serif] text-amber-300 text-sm tracking-widest">
                          {item.word}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">
                            {item.category}
                          </span>
                          <button
                            onClick={() => {
                              sounds.playClick();
                              gameStateManager.deleteForcaWord(item.id);
                              refreshData();
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                            title="Excluir palavra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">1. {item.hint1}</p>
                      <p className="text-[11px] text-slate-400 italic">2. {item.hint2}</p>
                      <p className="text-[11px] text-amber-400/80 italic">★ {item.extraHint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GERENCIAR TEMAS */}
          {activeTab === 'temas' && (
            <div className="space-y-6">
              <form onSubmit={handleAddTheme} className="bg-slate-950/70 p-4 rounded-2xl border border-cyan-500/40 space-y-3">
                <h3 className="font-['Lilita_One',sans-serif] text-base text-cyan-300 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  CRIAR NOVO TEMA
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: HISTÓRIA DO BRASIL, ASTRONOMIA, HARRY POTTER..."
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-['Lilita_One',sans-serif] text-sm uppercase shadow hover:brightness-110"
                  >
                    Adicionar
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {themes.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-['Lilita_One',sans-serif] text-sm text-cyan-300 uppercase">
                        {t.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{t.description || 'Tema customizado'}</p>
                    </div>
                    {themes.length > 1 && (
                      <button
                        onClick={() => {
                          gameStateManager.deleteTheme(t.id);
                          refreshData();
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                        title="Excluir Tema"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
