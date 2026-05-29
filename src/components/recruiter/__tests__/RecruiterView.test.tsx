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
  Object.defineProperty(window, 'print', { value: vi.fn(), writable: true });
});

describe('RecruiterView — rendering', () => {
  it('REC-01: renders masthead wordmark "ruslan.kanat"', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(screen.getByText('ruslan.kanat')).toBeInTheDocument();
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
    expect(screen.getByText('Available · Q3 start')).toBeInTheDocument();
  });

  it('REC-02: renders headline with em "AI products"', () => {
    render(<RecruiterView {...defaultProps} />);
    const em = screen.getByText('AI products');
    expect(em.tagName).toBe('EM');
  });

  it('REC-02: renders pitch paragraph with nine years copy', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(
      screen.getByText(/Nine years writing self-healing/i),
    ).toBeInTheDocument();
  });

  it('REC-02: renders Download PDF button', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /Download PDF/i }),
    ).toBeInTheDocument();
  });

  it('REC-02: renders mailto link to alex@morgan.dev (hero CTA)', () => {
    render(<RecruiterView {...defaultProps} />);
    // Multiple mailto links exist (hero + contact section) — check at least one has correct href
    const links = screen.getAllByRole('link', { name: /alex@morgan\.dev/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', 'mailto:alex@morgan.dev');
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

  it('REC-02: Download PDF button calls window.print()', async () => {
    const user = userEvent.setup();
    render(<RecruiterView {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Download PDF/i }));
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
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('0.4')).toBeInTheDocument();
    expect(screen.getByText('98.2')).toBeInTheDocument();
    expect(screen.getByText('1,247')).toBeInTheDocument();
  });

  it('REC-05: renders all three job role headings', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Staff SDET, AI Platform' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Senior SDET' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Automation Engineer' }),
    ).toBeInTheDocument();
  });

  it('REC-07: renders availability Status and Visa row values', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(screen.getByText('Open to offers · Q3 start')).toBeInTheDocument();
    expect(screen.getByText('US citizen — no sponsorship needed')).toBeInTheDocument();
  });

  it('REC-08: renders contact section with correct hrefs and rel attributes', () => {
    render(<RecruiterView {...defaultProps} />);
    // Large email line in contact-line paragraph
    const emailLinks = screen.getAllByRole('link', { name: /alex@morgan\.dev/i });
    expect(emailLinks.length).toBeGreaterThanOrEqual(1);
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:alex@morgan.dev');

    // Three contact item labels
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();

    // GitHub link has noopener
    const githubLink = screen.getByRole('link', { name: /github\.com\/amorgan/i });
    const githubRel = githubLink.getAttribute('rel') ?? '';
    expect(githubRel).toContain('noopener');

    // LinkedIn link has noopener
    const linkedinLink = screen.getByRole('link', { name: /in\/amorgan-sdet/i });
    const linkedinRel = linkedinLink.getAttribute('rel') ?? '';
    expect(linkedinRel).toContain('noopener');
  });
});
