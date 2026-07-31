// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../../components/ui/empty-state';

describe('frontend testing utilities', () => {
  it('renders empty-state content for assistive queries', () => { render(<EmptyState title="No orders" description="Orders will appear here." />); expect(screen.getByText('No orders')).toBeInTheDocument(); expect(screen.getByText('Orders will appear here.')).toBeVisible(); });
});
