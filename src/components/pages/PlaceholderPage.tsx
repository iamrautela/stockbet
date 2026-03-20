import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
    <Construction className="w-12 h-12 text-muted-foreground mb-4" />
    <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
    <p className="text-sm text-muted-foreground">This section is coming soon.</p>
  </div>
);

export default PlaceholderPage;
