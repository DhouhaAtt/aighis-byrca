"use client";

import { useEffect } from "react";
import { useLocale } from "../../context/LocaleContext";

export default function LangSetter() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
