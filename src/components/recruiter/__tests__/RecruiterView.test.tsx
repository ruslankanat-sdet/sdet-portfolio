/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RecruiterView } from '../RecruiterView';

const defaultProps = {
  onSwitchToIDE: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'print', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });
});

describe('RecruiterView — rendering', () => {
  it('REC-01: renders masthead wordmark "ruslan.kanatbek"', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(screen.getByText('ruslan.kanatbek')).toBeInTheDocument();
  });

  it('REC-01: renders Engineer view pill button in masthead', () => {
    render(<RecruiterView {...defaultProps} />);
    // Use getAllByRole to handle multiple matches (masthead + footer both reference engineer view)
    const buttons = screen.getAllByRole('button', { name: /Engineer view/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]).toBeInTheDocument();
  });

  it('REC-02: renders availability status value', () => {
    render(<RecruiterView {...defaultProps} />);
    const matches = screen.getAllByText('Open to opportunities · Q3 start');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0]).toBeInTheDocument();
  });

  it('REC-02: renders headline', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Senior SDET & Quality Architect — AI-Augmented Testing at Scale',
    );
  });

  it('REC-02: renders pitch paragraph with decade copy', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(
      screen.getByText(/For the past decade/i),
    ).toBeInTheDocument();
  });

  it('REC-02: renders Download PDF link and Print button', () => {
    render(<RecruiterView {...defaultProps} />);
    const downloadLink = screen.getByRole('link', { name: /Download PDF/i });
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/resume.pdf');
    expect(screen.getByRole('button', { name: /Print/i })).toBeInTheDocument();
  });

  it('REC-02: renders mailto link to ruslankanat.b@gmail.com (hero CTA)', () => {
    render(<RecruiterView {...defaultProps} />);
    // Multiple mailto links exist (hero + contact section) — check at least one has correct href
    const links = screen.getAllByRole('link', { name: /ruslankanat\.b@gmail\.com/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', 'mailto:ruslankanat.b@gmail.com');
  });
});

describe('RecruiterView — click interactions', () => {
  it('REC-01: masthead Engineer view pill click calls onSwitchToIDE', async () => {
    const user = userEvent.setup();
    render(<RecruiterView {...defaultProps} />);
    // Use first match (masthead) — multiple buttons reference "engineer view"
    const buttons = screen.getAllByRole('button', { name: /Engineer view/i });
    await user.click(buttons[0]);
    expect(defaultProps.onSwitchToIDE).toHaveBeenCalledOnce();
  });

  it('REC-02: Print button calls window.print()', async () => {
    const user = userEvent.setup();
    render(<RecruiterView {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Print/i }));
    expect(window.print).toHaveBeenCalledOnce();
  });

  it('REC-08: footer Open the IDE button click calls onSwitchToIDE', async () => {
    const user = userEvent.setup();
    render(<RecruiterView {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Open the IDE/i }));
    expect(defaultProps.onSwitchToIDE).toHaveBeenCalledOnce();
  });
});

describe('RecruiterView — content sections', () => {
  it('REC-03: renders all four metric numbers', () => {
    render(<RecruiterView {...defaultProps} />);
    // metricNum div text content includes the unit span ("10yrs", "80%", etc.)
    // use exact:false / regex so the match works regardless of the child <span> unit
    expect(screen.getByText(/^10/, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/^80/, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/^30/, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/^16/, { exact: false })).toBeInTheDocument();
  });

  it('REC-05: renders all three job role headings', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Senior SDET (AWS/Mobile/Web)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'SDET / Software Engineer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'QA Tester (Mobile)' }),
    ).toBeInTheDocument();
  });

  it('REC-07: renders availability Status and Visa row values', () => {
    render(<RecruiterView {...defaultProps} />);
    // Status value appears in both Hero eyebrow and AvailabilityCard — use getAllByText
    const statusMatches = screen.getAllByText('Open to opportunities · Q3 start');
    expect(statusMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Authorized to work in the US (details on request)')).toBeInTheDocument();
  });

  it('REC-08: renders contact section with correct hrefs and rel attributes', () => {
    render(<RecruiterView {...defaultProps} />);
    // Large email line in contact-line paragraph
    const emailLinks = screen.getAllByRole('link', { name: /ruslankanat\.b@gmail\.com/i });
    expect(emailLinks.length).toBeGreaterThanOrEqual(1);
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:ruslankanat.b@gmail.com');

    // Three contact item labels
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();

    // GitHub link has noopener
    const githubLink = screen.getByRole('link', { name: /github\.com\/ruslankanat-sdet/i });
    const githubRel = githubLink.getAttribute('rel') ?? '';
    expect(githubRel).toContain('noopener');

    // LinkedIn link has noopener
    const linkedinLink = screen.getByRole('link', { name: /in\/ruslan-kanatbek/i });
    const linkedinRel = linkedinLink.getAttribute('rel') ?? '';
    expect(linkedinRel).toContain('noopener');
  });
});
