import { Languages as LanguagesIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/lib/languages";

export function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="w-auto gap-2 rounded-full border-border/70 bg-card/80 px-3 backdrop-blur"
        aria-label="Select language"
      >
        <LanguagesIcon className="h-4 w-4 text-primary" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="mr-2">{lang.flag}</span>
            <span className="font-medium">{lang.native}</span>
            <span className="ml-1.5 text-muted-foreground">{lang.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
