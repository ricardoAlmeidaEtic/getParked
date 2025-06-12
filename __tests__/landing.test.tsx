import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';
import '@testing-library/jest-dom';

// Mock dos componentes usados na página principal
jest.mock('@/components/sections/hero-section', () => {
  return function MockHeroSection() {
    return <div data-testid="hero-section">Hero Section</div>;
  };
});

jest.mock('@/components/sections/stats-section', () => {
  return function MockStatsSection() {
    return <div data-testid="stats-section">Stats Section</div>;
  };
});

jest.mock('@/components/sections/features-section', () => {
  return function MockFeaturesSection() {
    return <div data-testid="features-section">Features Section</div>;
  };
});

jest.mock('@/components/sections/how-it-works-section', () => {
  return function MockHowItWorksSection() {
    return <div data-testid="how-it-works-section">How It Works Section</div>;
  };
});

jest.mock('@/components/sections/testimonials-section', () => {
  return function MockTestimonialsSection() {
    return <div data-testid="testimonials-section">Testimonials Section</div>;
  };
});

jest.mock('@/components/sections/pricing-section', () => {
  return function MockPricingSection() {
    return <div data-testid="pricing-section">Pricing Section</div>;
  };
});

jest.mock('@/components/sections/faq-section', () => {
  return function MockFaqSection() {
    return <div data-testid="faq-section">FAQ Section</div>;
  };
});

jest.mock('@/components/sections/cta-section', () => {
  return function MockCtaSection() {
    return <div data-testid="cta-section">CTA Section</div>;
  };
});

jest.mock('@/components/layout/footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

describe('LandingPage', () => {
  test('renderiza todas as seções da página principal', () => {
    render(<LandingPage />);
    
    // Verificar se todas as seções estão presentes
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Seção Hero: Renderizada com sucesso');
    console.log('✅ Seção Stats: Renderizada com sucesso');
    console.log('✅ Seção Features: Renderizada com sucesso');
    console.log('✅ Seção How It Works: Renderizada com sucesso');
    console.log('✅ Seção Testimonials: Renderizada com sucesso');
    console.log('✅ Seção Pricing: Renderizada com sucesso');
    console.log('✅ Seção FAQ: Renderizada com sucesso');
    console.log('✅ Seção CTA: Renderizada com sucesso');
    console.log('✅ Footer: Renderizado com sucesso');
  });
});
