import type { SetupId } from './options';

export interface ChecklistItem {
  /** Stable id stored in form state. */
  id: string;
  /** Technical term, English. Also used as the Google Sheets column header. */
  title: string;
  /** Persian explanation shown under the title. */
  description?: string;
}

const EMA_CONFIRMATION: ChecklistItem = {
  id: 'ema-confirmation',
  title: 'EMA Confirmation',
  description: 'تأیید قیمت نسبت به EMA',
};

const WITH_THE_TREND: ChecklistItem = {
  id: 'with-the-trend',
  title: 'With the Trend',
  description: 'معامله هم‌جهت با ترند است',
};

const VALID_SP2L_LEG: ChecklistItem = {
  id: 'valid-sp2l-leg',
  title: 'Valid SP2L Leg',
  description: 'لگ SP2L معتبر است',
};

export const CHECKLISTS: Record<SetupId, readonly ChecklistItem[]> = {
  SP2L: [
    {
      id: 'breakout-candle',
      title: 'Breakout Candle',
      description: 'دارای گپ و کلوز نزدیک به اکستریم',
    },
    {
      id: 'follow-through-candle',
      title: 'Follow-through Candle',
      description: 'کلوز نزدیک به اکستریم',
    },
    EMA_CONFIRMATION,
    { id: 'breakout', title: 'Breakout', description: 'شکست انجام شده است' },
    {
      id: 'valid-with-the-trend',
      title: 'Valid – With the Trend',
      description: 'معتبر و هم‌جهت با ترند',
    },
  ],
  'Pro BTB': [
    VALID_SP2L_LEG,
    {
      id: 'retracement-to-breakeven',
      title: 'Price Retracement to Breakeven',
      description: 'قیمت تا نقطه سر‌به‌سر (Breakeven) برگشته است',
    },
    EMA_CONFIRMATION,
    WITH_THE_TREND,
    {
      id: 'signal-bar-key-bar',
      title: 'Signal Bar & Key Bar',
      description: 'سیگنال بار و کی بار وجود دارد',
    },
  ],
  MicroMap: [VALID_SP2L_LEG, EMA_CONFIRMATION, WITH_THE_TREND],
};

export const getChecklist = (setup: SetupId): readonly ChecklistItem[] => CHECKLISTS[setup];
