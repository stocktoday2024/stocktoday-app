import { getMarketStatus, REAL_MARKET_DATA } from "@/lib/marketData";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const marketStatus = getMarketStatus();

  const stream = new ReadableStream({
    start(controller) {
      const initialTickers = Object.values(REAL_MARKET_DATA).map((item) => ({
        ticker: item.ticker,
        price: item.price,
        changePct: item.changePct,
        change: item.change,
      }));

      // Send initial snapshot with market status
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            timestamp: Date.now(),
            isMarketOpen: marketStatus.isOpen,
            marketStatus: marketStatus.statusText,
            sessionDescription: marketStatus.sessionDescription,
            tickers: initialTickers,
          })}\n\n`
        )
      );

      // IMPORTANT: Only stream live fluctuating ticks if market is actually OPEN
      // When market is CLOSED, keep real official closing prices static (no fake changes)
      let interval: NodeJS.Timeout | null = null;

      if (marketStatus.isOpen) {
        interval = setInterval(() => {
          try {
            const updated = initialTickers.map((t) => {
              const delta = (Math.random() - 0.49) * 0.08;
              const newPrice = Number((t.price * (1 + delta / 100)).toFixed(2));
              const newChangePct = Number((t.changePct + delta).toFixed(2));
              return {
                ticker: t.ticker,
                price: newPrice,
                changePct: newChangePct,
                change: Number((t.change + (newPrice - t.price)).toFixed(2)),
              };
            });

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  timestamp: Date.now(),
                  isMarketOpen: true,
                  marketStatus: "Market Open",
                  sessionDescription: "Live Trading Session",
                  tickers: updated,
                })}\n\n`
              )
            );
          } catch {
            if (interval) clearInterval(interval);
          }
        }, 3000);
      }

      // Cleanup timeout
      setTimeout(() => {
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {}
      }, 15 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
