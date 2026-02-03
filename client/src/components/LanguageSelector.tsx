import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Language = "pt" | "en" | "es";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>("pt");
  
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    // In a real implementation, this would update the i18n context
    // and potentially save the preference to localStorage
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9 px-2">
          <span className="text-lg leading-none">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`gap-3 cursor-pointer ${currentLang === lang.code ? "bg-accent" : ""}`}
          >
            <span className="text-lg leading-none">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
