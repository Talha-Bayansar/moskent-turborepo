import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { getLocale, locales, setLocale } from "~/paraglide/runtime";

type Locale = (typeof locales)[number];

const localeLabels: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  nl: "Nederlands",
};

export function LocaleSwitcher() {
  const currentLocale = getLocale();

  const handleValueChange = (value: Locale | null) => {
    // Only change locale if it's different and valid
    if (value !== currentLocale && locales.includes(value as Locale)) {
      setLocale(value as Locale);
    }
  };

  return (
    <Select value={currentLocale} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue>{(value) => localeLabels[value as Locale] ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeLabels[locale] ?? locale}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
