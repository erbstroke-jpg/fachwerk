import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { BookingProvider } from "@/lib/booking-state";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutVilla } from "@/components/AboutVilla";
import { InteriorGallery } from "@/components/InteriorGallery";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { FloatingBookButton } from "@/components/FloatingBookButton";
import { LoadingScreen } from "@/components/LoadingScreen";

export default async function HomePage() {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LoadingScreen />
      <BookingProvider>
        <Header locale={locale} />
        <main>
          <Hero />
          <AboutVilla />
          <InteriorGallery locale={locale} />
          <LocationSection locale={locale} />
        </main>
        <Footer />
        <BookingModal locale={locale} />
        <FloatingBookButton />
      </BookingProvider>
    </NextIntlClientProvider>
  );
}
