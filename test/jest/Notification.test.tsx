import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Notification from '../../src/components/common/Notification';

describe('Notification', () => {
  describe('rendering', () => {
    it('returns null when notification is null', () => {
      const { container } = render(
        <Notification notification={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when notification is undefined', () => {
      const { container } = render(
        <Notification notification={undefined as any} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders success notification with default styling when type is success', () => {
      const notification = {
        message: 'Operation completed successfully',
        type: 'success' as const,
      };

      const { container } = render(<Notification notification={notification} />);

      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
      // Find the outer div with background color (parent of the text)
      const notificationElement = container.querySelector('.bg-emerald-600');
      expect(notificationElement).toBeInTheDocument();
      expect(notificationElement).toHaveClass('bg-emerald-600');
    });

    it('renders success notification when type is not provided', () => {
      const notification = {
        message: 'Default success message',
      };

      const { container } = render(<Notification notification={notification} />);

      expect(screen.getByText('Default success message')).toBeInTheDocument();
      const notificationElement = container.querySelector('.bg-emerald-600');
      expect(notificationElement).toBeInTheDocument();
      expect(notificationElement).toHaveClass('bg-emerald-600');
    });

    it('renders error notification with error styling when type is error', () => {
      const notification = {
        message: 'An error occurred',
        type: 'error' as const,
      };

      const { container } = render(<Notification notification={notification} />);

      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      const notificationElement = container.querySelector('.bg-red-600');
      expect(notificationElement).toBeInTheDocument();
      expect(notificationElement).toHaveClass('bg-red-600');
    });
  });

  describe('dismiss button', () => {
    it('renders dismiss button when onDismiss is provided', () => {
      const notification = {
        message: 'Test message',
        type: 'success' as const,
      };
      const onDismiss = jest.fn();

      render(<Notification notification={notification} onDismiss={onDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toBeInTheDocument();
    });

    it('does not render dismiss button when onDismiss is not provided', () => {
      const notification = {
        message: 'Test message',
        type: 'success' as const,
      };

      render(<Notification notification={notification} />);

      expect(screen.queryByLabelText('Dismiss notification')).not.toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const notification = {
        message: 'Test message',
        type: 'success' as const,
      };
      const onDismiss = jest.fn();

      render(<Notification notification={notification} onDismiss={onDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss notification');
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label on dismiss button', () => {
      const notification = {
        message: 'Test message',
        type: 'success' as const,
      };
      const onDismiss = jest.fn();

      render(<Notification notification={notification} onDismiss={onDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });
  });
});


