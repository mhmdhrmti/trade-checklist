import { AppShell } from '@/components/ui/AppShell';
import { TradeFormProvider } from '@/context/TradeFormContext';
import { TradeForm } from '@/components/trade-form/TradeForm';

export default function HomePage() {
  return (
    <TradeFormProvider>
      <AppShell>
        <TradeForm />
      </AppShell>
    </TradeFormProvider>
  );
}
