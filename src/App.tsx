import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronUp,
  Clock,
  Flame,
  Play,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { lessons, topics } from "./data/lessons";
import type { Lesson } from "./types";

function App() {
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? topics[0];

  const visibleLessons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesTopic = lesson.topicId === activeTopicId;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        lesson.hook.toLowerCase().includes(normalizedQuery);
      return matchesTopic && matchesQuery;
    });
  }, [activeTopicId, query]);

  const savedLessons = lessons.filter((lesson) => savedIds.has(lesson.id));
  const completionRate =
    visibleLessons.length > 0
      ? Math.round(
          (visibleLessons.filter((lesson) => completedIds.has(lesson.id)).length /
            visibleLessons.length) *
            100,
        )
      : 0;

  const toggleCompleted = (lessonId: string) => {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const toggleSaved = (lessonId: string) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  return (
    <main className="app-shell">
      <aside className="side-panel" aria-label="Learning controls">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="eyebrow">Short-form learning</p>
            <h1>Learnify</h1>
          </div>
        </div>

        <label className="search-box" htmlFor="lesson-search">
          <Search size={18} />
          <input
            id="lesson-search"
            type="search"
            placeholder="Search lessons"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <section className="topic-list" aria-label="Topics">
          <div className="section-heading">
            <span>Topics</span>
            <span>{topics.length}</span>
          </div>
          {topics.map((topic) => (
            <button
              className={topic.id === activeTopicId ? "topic-button active" : "topic-button"}
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              style={{ "--topic-accent": topic.accent } as React.CSSProperties}
            >
              <span>{topic.title}</span>
              <small>{topic.level}</small>
            </button>
          ))}
        </section>

        <section className="progress-panel" aria-label="Progress">
          <div className="section-heading">
            <span>Progress</span>
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
        </section>

        <section className="saved-panel" aria-label="Saved lessons">
          <div className="section-heading">
            <span>Saved</span>
            <span>{savedLessons.length}</span>
          </div>
          {savedLessons.length === 0 ? (
            <p className="empty-state">Save lessons to build your personal learning queue.</p>
          ) : (
            <div className="saved-list">
              {savedLessons.map((lesson) => (
                <button
                  className="saved-item"
                  key={lesson.id}
                  onClick={() => setActiveTopicId(lesson.topicId)}
                >
                  {lesson.title}
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
            <h2>{activeTopic.title}</h2>
            <p>{activeTopic.description}</p>
          </div>
          <div className="feed-header-stat">
            <Trophy size={18} />
            <span>{activeTopic.lessonCount} lesson path</span>
          </div>
        </div>

        <div className="lesson-feed">
          {visibleLessons.map((lesson, index) => (
            <LessonCard
              index={index + 1}
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedIds.has(lesson.id)}
              isSaved={savedIds.has(lesson.id)}
              onComplete={() => toggleCompleted(lesson.id)}
              onSave={() => toggleSaved(lesson.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

type StatProps = {
  icon: React.ReactNode;
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
  onComplete: () => void;
  onSave: () => void;
};

function LessonCard({
  index,
  lesson,
  isCompleted,
  isSaved,
  onComplete,
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
      </div>

      <div className="lesson-content">
        <div className="lesson-meta">
          <span>{lesson.creator}</span>
          <span>
            <Clock size={14} />
            {lesson.difficulty}
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
        </div>

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

