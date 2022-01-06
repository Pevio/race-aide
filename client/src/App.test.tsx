import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Race Aide in the main menu', () => {
  render(<App />);
  const linkElement = screen.getByText(/Race Aide/i);
  expect(linkElement).toBeInTheDocument();
});
