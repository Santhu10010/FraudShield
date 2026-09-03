import { Transaction, checkFraud, INDIAN_CITIES } from "./fraud-engine";

export class TransactionStream {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: ((tx: Transaction) => void)[] = [];
  private txCounter = 1000;

  start(intervalMs = 4000) {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const tx = this.generateSingleTransaction();
      this.subscribers.forEach(sub => sub(tx));
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback: (tx: Transaction) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private generateSingleTransaction(): Transaction {
    this.txCounter++;
    const locations = [...INDIAN_CITIES.slice(0, 15), "VPN", "Unknown"];
    const behaviors = ["normal", "new device", "multiple failed attempts", "usual pattern", "rapid transactions"];
    
    const amount = Math.round(Math.random() * 800000 * 100) / 100;
    const location = locations[Math.floor(Math.random() * locations.length)];
    const time = new Date().toISOString();
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    
    const result = checkFraud({ amount, location, time, userBehavior: behavior });

    return {
      id: `TXN-${String(this.txCounter).padStart(5, "0")}`,
      userId: `USR-${String(Math.floor(Math.random() * 100) + 1).padStart(3, "0")}`,
      amount,
      location,
      timestamp: time,
      fraudScore: result.score,
      isFraud: result.status === "fraud",
      status: result.status,
      featureAttribution: result.featureAttribution,
    };
  }
}

export const transactionStream = new TransactionStream();
