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

  it('REC-01: renders Engineer view pill button', () => {
    render(<RecruiterView {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /Engineer view/i }),
    ).toBeInTheDocument();
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

  it('REC-02: renders mailto link to alex@morgan.dev', () => {
    render(<RecruiterView {...defaultProps} />);
    const link = screen.getByRole('link', { name: /alex@morgan\.dev/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'mailto:alex@morgan.dev');
  });
});

describe('RecruiterView — click interactions', () => {
  it('REC-01: masthead Engineer view pill click calls onSwitchToIDE', async () => {
    const user = userEvent.setup();
    render(<RecruiterView {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Engineer view/i }));
    expect(defaultProps.onSwitchToIDE).toHaveBeenCalledOnce();
  });

  it('REC-02: Download PDF button calls window.print()', async () => {
    const user = userEvent.setup();
    render(<RecruiterView {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Download PDF/i }));
    expect(window.print).toHaveBeenCalledOnce();
  });
});
