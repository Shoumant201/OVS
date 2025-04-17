'use client'

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { type Locale } from "@/lib/dictionary";

export default function LayoutWrapper({
  children,
  lang,
  dictionary,
}: {
  children: React.ReactNode;
  lang: Locale;
  dictionary: any;
}) {
  const pathname = usePathname();
  const hiddenPaths = [`/${lang}/login`, `/${lang}/register`];

  const hideLayout = pathname ? hiddenPaths.includes(pathname) : false;

  return (
    <>
      {!hideLayout && <Navbar locale={lang} dictionary={dictionary} />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
