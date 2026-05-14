export type SubscriptionStatus = 'trial' | 'active' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  price: number;               // 月額（円）。0 = 金額不明
  status: SubscriptionStatus;
  trialEndDate: string | null; // ISO date "YYYY-MM-DD"
  nextBillingDate: string | null;
  cancelUrl: string | null;
  cancelNotes: string | null;
  notifyDaysBefore: number;   // 通知するのは終了何日前か（デフォルト1）
  createdAt: string;          // ISO datetime
  updatedAt: string;
}
