import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronUp,
  Clock,
  Flame,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  WandSparkles,
} from "lucide-react";
import { lessons, topics } from "./data/lessons";
import type { FeedMode, Lesson } from "./types";

const progressKey = "learnify-progress-v2";

type StoredProgress = {
  completedIds: string[];
  savedIds: string[];
  dailyGoal: number;
};

function App() {
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [feedMode, setFeedMode] = useState<FeedMode>("for-you");
  const [dailyGoal, setDailyGoal] = useState(3);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(progressKey);
    if (!stored) {
      return;
    }

    try {
      const progress = JSON.parse(stored) as StoredProgress;
      setCompletedIds(new Set(progress.completedIds ?? []));
      setSavedIds(new Set(progress.savedIds ?? []));
      setDailyGoal(progress.dailyGoal ?? 3);
    } catch {
      window.localStorage.removeItem(progressKey);
    }
  }, []);

  useEffect(() => {
    const progress: StoredProgress = {
      completedIds: Array.from(completedIds),
      savedIds: Array.from(savedIds),
      dailyGoal,
    };
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [completedIds, savedIds, dailyGoal]);

  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? topics[0];
  const activeTopicLessons = lessons.filter((lesson) => lesson.topicId === activeTopicId);
  const savedLessons = lessons.filter((lesson) => savedIds.has(lesson.id));

  const visibleLessons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesMode =
        feedMode === "for-you" ||
        (feedMode === "focus" && lesson.topicId === activeTopicId) ||
        (feedMode === "saved" && savedIds.has(lesson.id));
      const matchesQuery =
        normalizedQuery.length === 0 ||
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        lesson.hook.toLowerCase().includes(normalizedQuery) ||
        lesson.skill.toLowerCase().includes(normalizedQuery);
      return matchesMode && matchesQuery;
    });
  }, [activeTopicId, feedMode, query, savedIds]);

  const completedToday = Math.min(completedIds.size, dailyGoal);
  const completionRate =
    dailyGoal > 0 ? Math.min(Math.round((completedToday / dailyGoal) * 100), 100) : 0;

  const nextLesson =
    activeTopicLessons.find((lesson) => !completedIds.has(lesson.id)) ?? activeTopicLessons[0];

  const toggleSetValue = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    value: string,
  ) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const resetProgress = () => {
    setCompletedIds(new Set());
    setSavedIds(new Set());
    setRevealedAnswers(new Set());
  };

  return (
    <main className="app-shell">
      <aside className="side-panel" aria-label="Learning controls">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="eyebrow">AI learning feed</p>
            <h1>Learnify</h1>
          </div>
        </div>

        <div className="goal-card">
          <div>
            <p className="eyebrow">Today</p>
            <strong>{completedToday} lessons learned</strong>
          </div>
          <label>
            Goal
            <input
              aria-label="Daily lesson goal"
              max={8}
              min={1}
              type="number"
              value={dailyGoal}
              onChange={(event) => setDailyGoal(Number(event.target.value))}
            />
          </label>
        </div>

        <label className="search-box" htmlFor="lesson-search">
          <Search size={18} />
          <input
            id="lesson-search"
            type="search"
            placeholder="Search topic, skill, or lesson"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="segmented-control" aria-label="Feed mode">
          {[
            ["for-you", "For you"],
            ["focus", "Focus"],
            ["saved", "Saved"],
          ].map(([mode, label]) => (
            <button
              className={feedMode === mode ? "active" : ""}
              key={mode}
              onClick={() => setFeedMode(mode as FeedMode)}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="topic-list" aria-label="Topics">
          <div className="section-heading">
            <span>Topics</span>
            <span>{topics.length}</span>
          </div>
          {topics.map((topic) => (
            <button
              className={topic.id === activeTopicId ? "topic-button active" : "topic-button"}
              key={topic.id}
              onClick={() => {
                setActiveTopicId(topic.id);
                setFeedMode("focus");
              }}
              style={{ "--topic-accent": topic.accent } as CSSProperties}
            >
              <span>{topic.title}</span>
              <small>{topic.level}</small>
            </button>
          ))}
        </section>

        <section className="progress-panel" aria-label="Progress">
          <div className="section-heading">
            <span>Daily progress</span>
            <span>{completionRate}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="stat-grid">
            <Stat icon={<Check size={16} />} label="Done" value={completedIds.size} />
            <Stat icon={<Bookmark size={16} />} label="Saved" value={savedIds.size} />
            <Stat icon={<Flame size={16} />} label="Streak" value="3" />
          </div>
          <button className="reset-button" onClick={resetProgress}>
            <RotateCcw size={16} />
            Reset demo progress
          </button>
        </section>

        <section className="saved-panel" aria-label="Saved lessons">
          <div className="section-heading">
            <span>Learning queue</span>
            <span>{savedLessons.length}</span>
          </div>
          {savedLessons.length === 0 ? (
            <p className="empty-state">Save lessons to build a queue for your next session.</p>
          ) : (
            <div className="saved-list">
              {savedLessons.map((lesson) => (
                <button
                  className="saved-item"
                  key={lesson.id}
                  onClick={() => {
                    setActiveTopicId(lesson.topicId);
                    setFeedMode("saved");
                  }}
                >
                  <span>{lesson.title}</span>
                  <small>{lesson.skill}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      </aside>

      <section className="feed-region" aria-label={`${activeTopic.title} lesson feed`}>
        <div className="feed-header">
          <div>
            <p className="eyebrow">Now learning</p>
            <h2>{feedMode === "saved" ? "Saved Lessons" : activeTopic.title}</h2>
            <p>{feedMode === "saved" ? "Your hand-picked queue for review." : activeTopic.description}</p>
          </div>
          <div className="feed-header-stat">
            <Trophy size={18} />
            <span>{activeTopic.lessonCount} lesson path</span>
          </div>
        </div>

        <div className="learning-plan">
          <div>
            <p className="eyebrow">Path outcome</p>
            <strong>{activeTopic.outcome}</strong>
          </div>
          <div>
            <p className="eyebrow">Up next</p>
            <strong>{nextLesson?.title ?? "No lesson selected"}</strong>
          </div>
          <div>
            <p className="eyebrow">Mode</p>
            <strong>{feedMode.replace("-", " ")}</strong>
          </div>
        </div>

        <div className="lesson-feed">
          {visibleLessons.length === 0 ? (
            <div className="empty-feed">
              <Target size={24} />
              <strong>No lessons match this view.</strong>
              <p>Try another topic, clear search, or save a few lessons first.</p>
            </div>
          ) : (
            visibleLessons.map((lesson, index) => (
              <LessonCard
                index={index + 1}
                key={lesson.id}
                lesson={lesson}
                isCompleted={completedIds.has(lesson.id)}
                isSaved={savedIds.has(lesson.id)}
                isAnswerVisible={revealedAnswers.has(lesson.id)}
                onComplete={() => toggleSetValue(setCompletedIds, lesson.id)}
                onRevealAnswer={() => toggleSetValue(setRevealedAnswers, lesson.id)}
                onSave={() => toggleSetValue(setSavedIds, lesson.id)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

type StatProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
};

function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="stat-item">
      {icon}
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

type LessonCardProps = {
  index: number;
  lesson: Lesson;
  isCompleted: boolean;
  isSaved: boolean;
  isAnswerVisible: boolean;
  onComplete: () => void;
  onRevealAnswer: () => void;
  onSave: () => void;
};

function LessonCard({
  index,
  lesson,
  isCompleted,
  isSaved,
  isAnswerVisible,
  onComplete,
  onRevealAnswer,
  onSave,
}: LessonCardProps) {
  return (
    <article className="lesson-card">
      <div className="media-frame">
        <img src={lesson.thumbnail} alt="" />
        <div className="media-overlay" />
        <div className="play-pill">
          <Play size={16} fill="currentColor" />
          <span>{lesson.duration}</span>
        </div>
        <div className="lesson-number">Lesson {index}</div>
        <div className="skill-chip">{lesson.skill}</div>
      </div>

      <div className="lesson-content">
        <div className="lesson-meta">
          <span>{lesson.creator}</span>
          <span>
            <Clock size={14} />
            {lesson.difficulty}
          </span>
          <span>
            <WandSparkles size={14} />
            AI-ready script
          </span>
        </div>
        <h3>{lesson.title}</h3>
        <p className="hook">{lesson.hook}</p>
        <p>{lesson.transcript}</p>

        <ul className="key-points">
          {lesson.keyPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="quiz-strip">
          <span>Quick check</span>
          <p>{lesson.quiz}</p>
          {isAnswerVisible && <strong>{lesson.answer}</strong>}
          <button className="text-button" onClick={onRevealAnswer}>
            {isAnswerVisible ? "Hide answer" : "Reveal answer"}
          </button>
        </div>

        <details className="ai-brief">
          <summary>AI generation brief</summary>
          <p>{lesson.aiPrompt}</p>
        </details>

        <div className="lesson-actions">
          <button className={isCompleted ? "primary complete" : "primary"} onClick={onComplete}>
            {isCompleted ? <Check size={18} /> : <ChevronUp size={18} />}
            {isCompleted ? "Completed" : "Mark learned"}
          </button>
          <button className="icon-button" onClick={onSave} aria-label="Save lesson">
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
        <p className="next-step">Next: {lesson.nextStep}</p>
      </div>
    </article>
  );
}

export default App;
