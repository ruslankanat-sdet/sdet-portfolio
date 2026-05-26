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

describe('Sidebar — interactions', () => {
  it('expands about folder and shows bio.json', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /toggle about folder/i }));
    expect(screen.getByRole('button', { name: /bio\.json/ })).toBeInTheDocument();
  });

  it('expands tests folder and shows landing.spec.ts', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /toggle tests folder/i }));
    expect(screen.getByRole('button', { name: /landing\.spec\.ts/ })).toBeInTheDocument();
  });

  it('clicking README.md calls setActiveFile and openTab with the filename', async () => {
    const user = userEvent.setup();
    const setActiveFile = vi.fn();
    const openTab = vi.fn();
    render(<Sidebar {...defaultProps} setActiveFile={setActiveFile} openTab={openTab} />);
    await user.click(screen.getByRole('button', { name: /README\.md/ }));
    expect(setActiveFile).toHaveBeenCalledOnce();
    expect(setActiveFile).toHaveBeenCalledWith('README.md');
    expect(openTab).toHaveBeenCalledOnce();
    expect(openTab).toHaveBeenCalledWith('README.md');
  });

  it('clicking a file row calls onSelect when provided', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Sidebar {...defaultProps} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /README\.md/ }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not throw when onSelect is not provided', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} />);
    // If the click throws or rejects, Vitest will fail the test automatically.
    await user.click(screen.getByRole('button', { name: /README\.md/ }));
  });
});
