import * as Notifications from 'expo-notifications';
import { scheduleTrialReminder, cancelReminder } from '../../src/notifications/scheduler';
import type { Subscription } from '../../src/types/subscription';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

const makeSub = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'test-id',
  name: 'Netflix',
  price: 1590,
  status: 'trial',
  trialEndDate: '2030-12-31', // far future so it's always schedulable
  nextBillingDate: '2030-12-31',
  cancelUrl: null,
  cancelNotes: null,
  notifyDaysBefore: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('scheduleTrialReminder', () => {
  it('schedules a notification for a trial subscription', async () => {
    await scheduleTrialReminder(makeSub());
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'trial-test-id',
        content: expect.objectContaining({ title: expect.stringContaining('Netflix') }),
      })
    );
  });

  it('does nothing if trialEndDate is null', async () => {
    await scheduleTrialReminder(makeSub({ trialEndDate: null }));
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels existing reminder before scheduling', async () => {
    await scheduleTrialReminder(makeSub());
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('trial-test-id');
  });
});

describe('cancelReminder', () => {
  it('cancels notification by subscription id', async () => {
    await cancelReminder('test-id');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('trial-test-id');
  });
});
