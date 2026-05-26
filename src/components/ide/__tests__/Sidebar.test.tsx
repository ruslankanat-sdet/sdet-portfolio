/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Sidebar } from '../Sidebar';

const defaultProps = {
  activeFile: 'README.md',
  setActiveFile: vi.fn(),
  openTab: vi.fn(),
  sidebarOpen: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sidebar — root file rendering', () => {
  it('renders README.md as a button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /README\.md/ })).toBeInTheDocument();
  });

  it('renders contact.json as a button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /contact\.json/ })).toBeInTheDocument();
  });

  it('does not render bio.json by default (about folder collapsed)', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /bio\.json/ })).toBeNull();
  });

  it('does not render landing.spec.ts by default (tests folder collapsed)', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /landing\.spec\.ts/ })).toBeNull();
  });

  it('is aria-hidden when sidebarOpen is false', () => {
    render(<Sidebar {...defaultProps} sidebarOpen={false} />);
    expect(screen.getByRole('complementary', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
  });
});
