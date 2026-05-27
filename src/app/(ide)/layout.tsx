import { SiteHeader } from '@/components/layout/SiteHeader';

export default function IDEGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="site-main">{children}</main>
    </>
  );
}
