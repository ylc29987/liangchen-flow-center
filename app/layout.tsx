import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "良辰流量运营中台",
  description: "流量、订单、兼职CRM、团队、项目与每日复盘的一体化运营系统",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
