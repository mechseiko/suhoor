import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Simple Test', () => {
    test('renders a basic component', () => {
        render(<div>Hello Jest</div>);
        expect(screen.getByText('Hello Jest')).toBeInTheDocument();
    });
});
