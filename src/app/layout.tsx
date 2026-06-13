import type { Metadata } from "next";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/components/ThemeProvider";
import SyncOnLoad from "@/components/SyncOnLoad";
import "./globals.css";

export const metadata: Metadata = {
  title: "오남고 1학년 국어: 문법 연습",
  description: "고등학교 국어 문법 인출·적용 연습 웹앱",
  // iOS '홈 화면에 추가' 시 표시되는 앱 이름
  appleWebApp: {
    capable: true,
    title: "국어 문법 연습",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <SyncOnLoad />
          <Header />
          <main className="pb-32">{children}</main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
