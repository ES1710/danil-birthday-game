"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { PublicQuizQuestion } from "@/data/questions";

type Screen = "home" | "quiz" | "result";

type AnswerFeedback = {
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
};

type LeaderboardRow = {
  place: number;
  name: string;
  score: number;
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Произошла ошибка. Попробуйте ещё раз.");
  }

  return payload;
}

function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/results", { signal: controller.signal, cache: "no-store" })
      .then((response) => readJson<LeaderboardRow[]>(response))
      .then(setRows)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить результаты.");
      })
      .finally(() => setLoading(false));

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      controller.abort();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="leaderboard-modal pixel-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label="Закрыть таблицу">
          ×
        </button>
        <h2 id="leaderboard-title">Таблица результатов</h2>

        {loading && <p className="status-message">Загрузка...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Место</th>
                  <th>Имя</th>
                  <th>Результат</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Пока никто не прошёл тест</td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={`${row.name}-${index}`}>
                      <td>{row.place}</td>
                      <td>{row.name}</td>
                      <td>{row.score}/15</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [questions, setQuestions] = useState<PublicQuizQuestion[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [score, setScore] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [checkingName, setCheckingName] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/questions")
      .then((response) => readJson<PublicQuizQuestion[]>(response))
      .then(setQuestions)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить вопросы.");
      })
      .finally(() => setLoadingQuestions(false));
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = useMemo(
    () => (questions.length === 0 ? 0 : ((currentIndex + 1) / questions.length) * 100),
    [currentIndex, questions.length],
  );

  async function startQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = nameInput.trim().replace(/\s+/g, " ");

    if (name.length < 2 || name.length > 30) {
      setError("Введите имя длиной от 2 до 30 символов.");
      return;
    }

    if (questions.length !== 15) {
      setError("Вопросы ещё загружаются. Попробуйте снова.");
      return;
    }

    setCheckingName(true);
    setError("");

    try {
      const response = await fetch(`/api/results?name=${encodeURIComponent(name)}`, { cache: "no-store" });
      const result = await readJson<{ available: boolean }>(response);

      if (!result.available) {
        setError("Это имя уже занято. Выберите другое имя.");
        return;
      }

      setPlayerName(name);
      setCurrentIndex(0);
      setAnswers({});
      setFeedback(null);
      setScore(0);
      setScreen("quiz");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось начать тест.");
    } finally {
      setCheckingName(false);
    }
  }

  async function chooseAnswer(selectedIndex: number) {
    if (!currentQuestion || feedback || checkingAnswer) {
      return;
    }

    setCheckingAnswer(true);
    setError("");

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, selectedIndex }),
      });
      const result = await readJson<{ correctIndex: number; isCorrect: boolean }>(response);

      setAnswers((current) => ({ ...current, [currentQuestion.id]: selectedIndex }));
      setFeedback({ selectedIndex, ...result });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось проверить ответ.");
    } finally {
      setCheckingAnswer(false);
    }
  }

  async function finishQuiz() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName,
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedIndex: answers[question.id],
          })),
        }),
      });
      const result = await readJson<{ score: number }>(response);
      setScore(result.score);
      setScreen("result");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось сохранить результат.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (!feedback) {
      return;
    }

    if (currentIndex === questions.length - 1) {
      void finishQuiz();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setFeedback(null);
    setError("");
  }

  function returnHome() {
    setScreen("home");
    setNameInput("");
    setPlayerName("");
    setCurrentIndex(0);
    setAnswers({});
    setFeedback(null);
    setScore(0);
    setError("");
  }

  return (
    <main className="game-shell">
      <div className="pixel-stars" aria-hidden="true" />

      {screen === "home" && (
        <section className="game-card pixel-panel home-card">
          <p className="eyebrow">ДАНИЛ: LEVEL UP</p>
          <h1>Тест на знание Данила</h1>

          <div className="art-frame start-art">
            <Image
              className="art-image"
              src="/images/quiz/start.png"
              alt="Данил на начальном экране"
              fill
              priority
              sizes="(max-width: 700px) 78vw, 390px"
            />
          </div>

          <form className="start-form" onSubmit={startQuiz}>
            <label htmlFor="player-name">Введите своё имя</label>
            <input
              id="player-name"
              value={nameInput}
              onChange={(event) => {
                setNameInput(event.target.value);
                setError("");
              }}
              maxLength={30}
              placeholder="Ваше имя"
              autoComplete="off"
            />

            {error && <p className="error-message">{error}</p>}

            <button
              className="pixel-button primary-button"
              type="submit"
              disabled={!nameInput.trim() || checkingName || loadingQuestions}
            >
              {checkingName ? "Проверяем имя..." : loadingQuestions ? "Загрузка..." : "Начать тест"}
            </button>
          </form>

          <button
            className="pixel-button secondary-button"
            type="button"
            onClick={() => setLeaderboardOpen(true)}
          >
            Посмотреть таблицу результатов
          </button>
        </section>
      )}

      {screen === "quiz" && currentQuestion && (
        <section className="game-card pixel-panel question-card">
          <div className="question-topline">
            <span>Вопрос {currentIndex + 1}/{questions.length}</span>
            <span>{playerName}</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="art-frame question-art">
            <Image
              className="art-image"
              src={currentQuestion.image}
              alt={`Иллюстрация к вопросу ${currentIndex + 1}`}
              fill
              sizes="(max-width: 700px) 78vw, 410px"
            />
          </div>

          <h2>{currentQuestion.text}</h2>

          <div className="answers-grid">
            {currentQuestion.options.map((option, optionIndex) => {
              let stateClass = "";

              if (feedback?.correctIndex === optionIndex) {
                stateClass = " correct";
              } else if (feedback?.selectedIndex === optionIndex) {
                stateClass = " wrong";
              }

              return (
                <button
                  className={`answer-button${stateClass}`}
                  type="button"
                  key={option}
                  disabled={feedback !== null || checkingAnswer}
                  onClick={() => void chooseAnswer(optionIndex)}
                >
                  <span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {feedback && (
            <p className={`answer-status ${feedback.isCorrect ? "success" : "failure"}`}>
              {feedback.isCorrect ? "Верно! +1 очко" : "Не угадал! Верный ответ отмечен зелёным."}
            </p>
          )}
          {error && <p className="error-message">{error}</p>}

          <button
            className="pixel-button primary-button next-button"
            type="button"
            disabled={!feedback || submitting}
            onClick={goNext}
          >
            {submitting
              ? "Сохраняем результат..."
              : currentIndex === questions.length - 1
                ? "Перейти к результату"
                : "Перейти к следующему вопросу"}
          </button>
        </section>
      )}

      {screen === "result" && (
        <section className="game-card pixel-panel result-card">
          <p className="eyebrow">ТЕСТ ЗАВЕРШЁН</p>
          <div className="art-frame result-art">
            <Image
              className="art-image"
              src="/images/quiz/result.png"
              alt="Финальная иллюстрация"
              fill
              priority
              sizes="(max-width: 700px) 80vw, 430px"
            />
          </div>
          <h1>Твой результат:</h1>
          <div className="score-box">
            <strong>{score}</strong>
            <span>из 15</span>
          </div>

          <button
            className="pixel-button primary-button"
            type="button"
            onClick={() => setLeaderboardOpen(true)}
          >
            Посмотреть таблицу результатов
          </button>
          <button className="pixel-button secondary-button" type="button" onClick={returnHome}>
            Вернуться на главную страницу
          </button>
        </section>
      )}

      {leaderboardOpen && <LeaderboardModal onClose={() => setLeaderboardOpen(false)} />}
    </main>
  );
}
