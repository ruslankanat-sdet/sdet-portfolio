'use client';

import { LogoMark } from './LogoMark';

interface DoorScreenProps {
  onChooseRecruiter: () => void;
  onChooseIDE: () => void;
}

export function DoorScreen({ onChooseRecruiter, onChooseIDE }: DoorScreenProps) {
  // A single visually-hidden <h1> satisfies WCAG 1.3.1; the two door-name
  // elements are styled <p> tags (presentational headings, not structure).
  const handleRecruiterKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onChooseRecruiter();
    } else if (e.key === ' ') {
      e.preventDefault();
      onChooseRecruiter();
    }
  };

  const handleIDEKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onChooseIDE();
    } else if (e.key === ' ') {
      e.preventDefault();
      onChooseIDE();
    }
  };

  return (
    <div className="door">
      <h1 className="sr-only">Ruslan Kanatbek — SDET Portfolio</h1>
      <div
        className="door-half door-half-recruiter"
        role="button"
        tabIndex={0}
        onClick={onChooseRecruiter}
        onKeyDown={handleRecruiterKey}
      >
        <div className="door-bg-pattern" aria-hidden="true" />
        <div className="door-id">
          <span className="door-id-mark">
            <LogoMark size={16} />
          </span>
          <span className="door-id-wordmark">ruslan.kanatbek</span>
        </div>
        <div className="door-eyebrow">
          <span className="dot" aria-hidden="true" />
          <span>For recruiters &amp; hiring partners</span>
        </div>
        <div className="door-body">
          <p className="door-name">
            Ruslan <em>Kanatbek</em>
          </p>
          <div className="door-tagline">
            A readable, single-column résumé. The career, the numbers, how to reach me.
          </div>
        </div>
        <div className="door-foot">
          <span className="door-cta">
            <span>Enter the résumé</span>
            <span className="arrow" aria-hidden="true">→</span>
          </span>
          <span>≈ 90 sec read</span>
        </div>
      </div>

      <div
        className="door-half door-half-ide"
        role="button"
        tabIndex={0}
        onClick={onChooseIDE}
        onKeyDown={handleIDEKey}
      >
        <div className="door-id">
          <span className="door-id-mark">
            <LogoMark size={16} />
          </span>
          <span className="door-id-wordmark">ruslan.kanatbek</span>
        </div>
        <div className="door-eyebrow">
          <span className="dot" aria-hidden="true" />
          <span>For engineering leads &amp; technical interviewers</span>
        </div>
        <div className="door-body">
          <p className="door-name">
            ruslan<span className="accent">.</span>kanatbek
          </p>
          <div className="door-tagline">
            Open the files, run the smoke test, ask the agent.
          </div>
        </div>
        <div className="door-foot">
          <span className="door-cta">
            <span>$ ./open-ide</span>
            <span className="arrow" aria-hidden="true">→</span>
          </span>
          <span>react · ide</span>
        </div>
      </div>
    </div>
  );
}
