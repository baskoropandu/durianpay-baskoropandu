import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each(['completed', 'processing', 'failed'] as const)('renders %s status', (status) => {
    render(<StatusBadge status={status} />);
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
