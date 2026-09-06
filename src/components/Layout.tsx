import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
