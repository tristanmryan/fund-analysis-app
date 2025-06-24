/* eslint-disable no-restricted-globals */
self.onmessage = async ({ data }) => {
  const { file, config } = data;
  try {
    const module = await import('../services/fundProcessingService.js');
    const id = await module.process(file, config);
    self.postMessage({ status: 'done', snapshotId: id });
  } catch (e) {
    self.postMessage({ status: 'error', message: e.message });
  }
};
