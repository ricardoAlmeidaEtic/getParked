"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "./button";
import { setCookie, getCookie } from "@/lib/cookies";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    setCookie("cookie-consent", "true");
    setIsVisible(false);
  };

  const declineCookies = () => {
    setCookie("cookie-consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-sm text-gray-600">
            <p>
              Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{" "}
              <Link href="/politica-de-privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>{" "}
              e{" "}
              <Link href="/politica-de-cookies" className="text-primary hover:underline">
                Política de Cookies
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={declineCookies}
              className="text-sm"
            >
              Recusar
            </Button>
            <Button
              onClick={acceptCookies}
              className="text-sm"
            >
              Aceitar
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}