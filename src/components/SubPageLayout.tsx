import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface SubPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const SubPageLayout = ({ title, children }: SubPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-heading font-semibold text-foreground">{title}</h1>
      </header>
      <div className="p-6 max-w-md mx-auto">{children}</div>
    </div>
  );
};

export default SubPageLayout;
