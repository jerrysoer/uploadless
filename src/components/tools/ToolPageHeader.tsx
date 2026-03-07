import PrivacyBadge from "@/components/PrivacyBadge";

interface ToolPageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export default function ToolPageHeader({
  icon: Icon,
  title,
  description,
}: ToolPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-text-tertiary" />
        <h1 className="font-heading font-bold text-3xl">{title}</h1>
      </div>
      <p className="text-text-secondary mb-4">{description}</p>
      <PrivacyBadge />
      <hr className="editorial-rule mt-6" />
    </div>
  );
}
