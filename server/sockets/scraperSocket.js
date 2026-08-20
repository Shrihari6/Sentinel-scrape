import { executeScrapeJob } from '../services/brightdata.js';

export function setupScraperSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.emit('socket:status', {
      connected: true,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      message: 'Connected to SentinelScrape Multi-Domain Engine'
    });

    socket.on('scrape:trigger', async (payload = {}) => {
      const domain = payload.domain || 'books';
      const targetUrl = payload.targetUrl || payload.url || 'https://books.toscrape.com';
      const searchQuery = payload.searchQuery || '';
      const collectorId = payload.collectorId || 'c_mp7x8a9b2c0d1e2f';
      const maxPages = parseInt(payload.maxPages) || 3;
      const limit = parseInt(payload.limit) || 100;

      console.log(`[Socket.io] Scrape triggered by ${socket.id} (Domain: ${domain}, Query: "${searchQuery}", Pages: ${maxPages}, Limit: ${limit})`);

      const sendProgress = (stepMessage, percent) => {
        socket.emit('scrape:progress', {
          step: stepMessage,
          percent,
          timestamp: new Date().toISOString()
        });
      };

      const sendWarning = (warningMessage) => {
        socket.emit('scrape:warning', {
          message: warningMessage,
          timestamp: new Date().toISOString()
        });
      };

      let totalBatchItems = 0;
      let jobCompletedSuccessfully = false;

      try {
        sendProgress(`Initializing ${domain.toUpperCase()} scraping engine...`, 5);
        await new Promise((r) => setTimeout(r, 250));

        const result = await executeScrapeJob({
          domain,
          url: targetUrl,
          searchQuery,
          collectorId,
          maxPages,
          limit,
          onProgress: (stepMsg, pct) => {
            sendProgress(stepMsg, pct);
          },
          onWarning: (warningMsg) => {
            sendWarning(warningMsg);
          },
          onBatchData: (batchItems, pageNum) => {
            totalBatchItems += batchItems.length;
            // Real-time Socket Streaming of incremental data batches
            socket.emit('scrape:batch_data', {
              domain,
              page: pageNum,
              batch: batchItems,
              batchCount: batchItems.length,
              totalSoFar: totalBatchItems,
              timestamp: new Date().toISOString()
            });
          }
        });

        // Emit final aggregate payload
        socket.emit('scrape:data', {
          domain: result.domain,
          items: result.data,
          count: result.itemCount,
          timestamp: result.timestamp
        });

        socket.emit('scrape:complete', {
          success: true,
          domain: result.domain,
          collectorId: result.collectorId,
          targetUrl: result.targetUrl,
          searchQuery: result.searchQuery,
          itemCount: result.itemCount,
          pagesScraped: result.pagesScraped,
          duration: result.duration,
          timestamp: result.timestamp
        });

        jobCompletedSuccessfully = true;

      } catch (error) {
        console.error(`[Socket.io] Scrape error for ${socket.id}:`, error.message);
        socket.emit('scrape:error', {
          message: error.message || 'An unexpected error occurred during scraping',
          timestamp: new Date().toISOString()
        });
      } finally {
        if (!jobCompletedSuccessfully) {
          socket.emit('scrape:complete', {
            success: false,
            terminatedWithError: true,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected (${socket.id}): ${reason}`);
    });
  });
}
