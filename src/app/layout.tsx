import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
});

/* ── 사이트 기본 정보 ────────────────────────────────────────────────────────
   실제 배포 전 아래 값만 교체하면 메타데이터 전체에 반영된다.
   TODO: 이름·도메인·문구를 실제 값으로 교체할 것. */
const SITE = {
  name: "DEV STUDIO",                // 플레이스홀더 워드마크(공부용) — 실제 이름 아님
  description:                       // 한 줄 소개(Hero 문구 기반)
    "Clean code. Scalable products. Meaningful experiences.",
  url: "https://example.dev",        // 플레이스홀더 도메인(example.* = RFC 2606 예약)
} as const;

const TITLE = `${SITE.name} | 개발자 포트폴리오`;

export const metadata: Metadata = {
  // OG/Twitter 이미지의 상대경로("/og-image.png")를 절대 URL로 만들어주는 기준.
  // TODO: 배포 도메인 확정 후 SITE.url 교체.
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: SITE.description,
  openGraph: {
    title: TITLE,
    description: SITE.description,
    type: "website",
    url: SITE.url,
    siteName: TITLE,
    locale: "ko_KR",
    images: [
      {
        // TODO: public/og-image.png 준비 (권장 1200×630). 없으면 크롤러에서 404.
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} 포트폴리오`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.description,
    images: ["/og-image.png"], // TODO: OG 이미지와 동일 파일
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
