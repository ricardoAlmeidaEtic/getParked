// Mock do toast com funções simples que podemos espionar nos testes
const success = jest.fn();
const error = jest.fn();
const info = jest.fn();
const warning = jest.fn();

export const showToast = {
  success,
  error,
  info,
  warning
};

// Reset dos mocks
export const resetToastMocks = () => {
  success.mockClear();
  error.mockClear();
  info.mockClear();
  warning.mockClear();
};
