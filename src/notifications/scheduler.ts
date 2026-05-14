import * as Notifications from 'expo-notifications';
import type { Subscription } from '../types/subscription';

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTrialReminder(sub: Subscription): Promise<void> {
  if (!sub.trialEndDate) return;

  await cancelReminder(sub.id);

  const notifyDate = new Date(sub.trialEndDate);
  notifyDate.setDate(notifyDate.getDate() - sub.notifyDaysBefore);
  notifyDate.setHours(9, 0, 0, 0);

  if (notifyDate <= new Date()) return;

  const priceText = sub.price > 0 ? `¥${sub.price.toLocaleString()}/月` : '有料プラン';

  await Notifications.scheduleNotificationAsync({
    identifier: `trial-${sub.id}`,
    content: {
      title: `${sub.name} の無料トライアルが明日終わります`,
      body: `${priceText}の自動課金が始まります。解約はアプリから確認できます。`,
      data: { subscriptionId: sub.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyDate,
    } as any,
  });
}

export async function cancelReminder(subId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`trial-${subId}`);
}

export async function rescheduleAll(subs: Subscription[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(
    subs
      .filter((s) => s.status === 'trial' && s.trialEndDate)
      .map((s) => scheduleTrialReminder(s))
  );
}

export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'test-notification',
    content: {
      title: '通知テスト',
      body: '通知が正常に届いています。トライアル終了前日にこのように通知されます。',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    } as any,
  });
}
