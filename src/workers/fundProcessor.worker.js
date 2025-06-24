/* eslint-disable no-restricted-globals */
self.onmessage = async ({ data }) => {
  const { file, config } = data;
  try {
    const module = await import('../services/fundProcessingService.js');
    const funds = await module.process(file, config);
    self.postMessage({ status: 'done', funds });
  } catch (e) {
    self.postMessage({ status: 'error', message: e.message });
  }
};
