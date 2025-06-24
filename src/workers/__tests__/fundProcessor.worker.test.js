const mockProcess = jest.fn();
jest.mock('../../services/fundProcessingService', () => ({
  process: mockProcess
}));

const { process } = require('../../services/fundProcessingService');

describe('fundProcessor worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('posts processed funds back', async () => {
    process.mockResolvedValue(['fundA']);

    const postMessage = jest.fn();
    Object.defineProperty(global, 'self', { writable: true, value: { postMessage } });

    // Require after setting self so the handler registers
    require('../fundProcessor.worker.js');

    await global.self.onmessage({ data: { file: 'file', config: { a: 1 } } });

    expect(process).toHaveBeenCalledWith('file', { a: 1 });
    expect(postMessage).toHaveBeenCalledWith({ status: 'done', funds: ['fundA'] });
  });
});
