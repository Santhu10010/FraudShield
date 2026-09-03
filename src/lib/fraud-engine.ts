export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  location: string;
  timestamp: string;
  fraudScore: number;
  isFraud: boolean;
  status: "safe" | "suspicious" | "fraud";
  featureAttribution?: Record<string, number>;
}

export interface FraudCheckInput {
  amount: number;
  location: string;
  time: string;
  userBehavior: string;
}

const HIGH_RISK_LOCATIONS = ["Unknown", "VPN", "Proxy", "Dark Web"];
const SUSPICIOUS_BEHAVIORS = [
  "new device",
  "multiple failed attempts",
  "unusual hours",
  "rapid transactions",
  "location change",
  "otp sharing",
  "unknown upi id",
];

export const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Surat", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Coimbatore", "Kochi", "Chandigarh", "Guwahati", "Ranchi", "Dehradun", "Noida",
];

export function checkFraud(input: FraudCheckInput): {
  score: number;
  status: "safe" | "suspicious" | "fraud";
  featureAttribution: Record<string, number>;
} {
  let score = 0;
  const featureAttribution: Record<string, number> = {
    amountSpike: 0,
    locationMismatch: 0,
    velocity: 0,
    unusualHours: 0,
  };

  if (input.amount > 500000) { score += 35; featureAttribution.amountSpike = 35; }
  else if (input.amount > 100000) { score += 20; featureAttribution.amountSpike = 20; }
  else if (input.amount > 50000) { score += 10; featureAttribution.amountSpike = 10; }

  if (HIGH_RISK_LOCATIONS.some((l) => input.location.toLowerCase().includes(l.toLowerCase()))) {
    score += 30;
    featureAttribution.locationMismatch = 30;
  }

  const hour = new Date(input.time).getHours();
  if (hour >= 1 && hour <= 5) {
    score += 15;
    featureAttribution.unusualHours = 15;
  }

  const behaviorLower = input.userBehavior.toLowerCase();
  SUSPICIOUS_BEHAVIORS.forEach((b) => {
    if (behaviorLower.includes(b)) {
      score += 12;
      featureAttribution.velocity += 12; // grouping behaviors into velocity/pattern
    }
  });

  const noise = Math.random() * 10 - 5;
  score += noise;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const status = score >= 70 ? "fraud" : score >= 40 ? "suspicious" : "safe";
  return { score, status, featureAttribution };
}

export function generateMockTransactions(count: number): Transaction[] {
  const locations = [...INDIAN_CITIES.slice(0, 15), "VPN", "Unknown"];
  const behaviors = ["normal", "new device", "multiple failed attempts", "usual pattern", "rapid transactions"];

  return Array.from({ length: count }, (_, i) => {
    const amount = Math.round(Math.random() * 800000 * 100) / 100;
    const location = locations[Math.floor(Math.random() * locations.length)];
    const time = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    const result = checkFraud({ amount, location, time, userBehavior: behavior });

    return {
      id: `TXN-${String(i + 1).padStart(5, "0")}`,
      userId: `USR-${String(Math.floor(Math.random() * 100) + 1).padStart(3, "0")}`,
      amount,
      location,
      timestamp: time,
      fraudScore: result.score,
      isFraud: result.status === "fraud",
      status: result.status,
      featureAttribution: result.featureAttribution,
    };
  });
}
