export type SubscriptionStatus = 'trial' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  status: SubscriptionStatus;
  trialEndDate: string | null;
  cancelUrl: string | null;
  notifyDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}
