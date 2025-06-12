// jest.setup.js
import '@testing-library/jest-dom';

// Mock para ResizeObserver que é necessário para componentes do Radix UI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;

// Mock para o console.error para suprimir erros de componentes em testes
const originalConsoleError = console.error;
console.error = (...args) => {
  // Evitar erros relacionados a problemas de rendering do React em testes
  if (typeof args[0] === 'string' && 
      (args[0].includes('Warning:') || 
       args[0].includes('React does not recognize') || 
       args[0].includes('Invalid DOM property'))) {
    return;
  }
  originalConsoleError(...args);
};

// Mock para o IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = IntersectionObserverMock;

// Mock para animações do DOM
Object.defineProperty(global.Element.prototype, 'animate', {
  value: () => ({
    finished: Promise.resolve(),
    cancel: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
  }),
  configurable: true,
});
