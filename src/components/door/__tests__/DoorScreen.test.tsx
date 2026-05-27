/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DoorScreen } from '../DoorScreen';

const defaultProps = {
  onChooseRecruiter: vi.fn(),
  onChooseIDE: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DoorScreen — rendering', () => {
  it('renders two role=button halves', () => {
    render(<DoorScreen {...defaultProps} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('recruiter half shows the D-02 tagline and Enter CTA', () => {
    render(<DoorScreen {...defaultProps} />);
    expect(screen.getByText(/A readable, single-column résumé\./i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the résumé/i)).toBeInTheDocument();
  });

  it('IDE half shows the D-03 tagline and open-ide CTA', () => {
    render(<DoorScreen {...defaultProps} />);
    expect(screen.getByText(/Open the files, run the smoke test, ask the agent\./i)).toBeInTheDocument();
    expect(screen.getByText(/\$ \.\/open-ide/i)).toBeInTheDocument();
  });

  it('wordmark ruslan.kanatbek appears twice (one per half)', () => {
    render(<DoorScreen {...defaultProps} />);
    expect(screen.getAllByText('ruslan.kanatbek')).toHaveLength(2);
  });
});

describe('DoorScreen — click interactions', () => {
  it('clicking recruiter half calls onChooseRecruiter', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.click(screen.getAllByRole('button')[0]);
    expect(defaultProps.onChooseRecruiter).toHaveBeenCalledOnce();
    expect(defaultProps.onChooseIDE).not.toHaveBeenCalled();
  });

  it('clicking IDE half calls onChooseIDE', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.click(screen.getAllByRole('button')[1]);
    expect(defaultProps.onChooseIDE).toHaveBeenCalledOnce();
    expect(defaultProps.onChooseRecruiter).not.toHaveBeenCalled();
  });
});

describe('DoorScreen — keyboard interactions', () => {
  it('Enter on focused recruiter half calls onChooseRecruiter', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(defaultProps.onChooseRecruiter).toHaveBeenCalledOnce();
  });

  it('Space on focused recruiter half calls onChooseRecruiter and prevents default', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.tab();
    await user.keyboard(' ');
    expect(defaultProps.onChooseRecruiter).toHaveBeenCalledOnce();
  });

  it('Enter on focused IDE half calls onChooseIDE', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(defaultProps.onChooseIDE).toHaveBeenCalledOnce();
  });
});
