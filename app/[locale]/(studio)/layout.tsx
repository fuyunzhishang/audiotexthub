import { ReactNode } from 'react';
import LocaleToggle from '@/components/locale/toggle';

export default async function StudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      <div className="absolute top-4 right-4 z-50">
        <LocaleToggle />
      </div>
      {children}
    </div>
  );
}