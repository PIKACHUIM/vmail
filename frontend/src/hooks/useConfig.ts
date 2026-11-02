import { createContext, useContext } from "react";

// 定义配置的类型
export interface AppConfig {
  emailDomain: string[]; // 修改为字符串数组
  turnstileKey: string;
  turnstileEnabled: boolean;
  sitePasswordEnabled: boolean;
  apiRateLimitPerMinute: number;
  openApiEnabled: boolean;
  authEnabled: boolean;
  // 已配置凭据的登录渠道，未配置的渠道不展示入口
  authProviders?: Array<"github" | "google">;
  setupRequired: boolean;
  upgradeNotice: string;
  apiDailyLimit: number;
  mailboxDailyLimit: number;
  maxApiKeys: number;
  // feat: 添加 cookiesSecret 到配置中，以便前端加密时使用
  cookiesSecret: string;
  // feat: 控制是否展示推广弹框和常驻链接
  showAff: boolean;
  // 可用的邮件发送渠道列表，如 ['resend', 'mailchannels']
  enabledSenders: Array<"resend" | "mailchannels" | "cloudflare">;
  // 当前启用的发件渠道，由 SEND_CHANNEL 环境变量决定
  sendChannel: "" | "resend" | "mailchannels" | "cloudflare";
  // 后端配置的、发件渠道允许或已验证的发件邮箱
  senderEmail: string;
  // 邮箱生命周期（小时）：匿名 / 登录用户
  mailboxExpiryHours: number;
  userMailboxExpiryHours: number;
  // 是否允许手动延长有效期
  mailboxRenewEnabled: boolean;
  // 自定义用户名最大长度，0 表示禁用
  mailboxNameLength: number;
  // 随机地址长度
  mailboxRandomLength: number;
}

// 创建 React Context
export const ConfigContext = createContext<AppConfig | null>(null);

// 创建一个自定义 Hook 以方便地使用配置
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig 必须在 ConfigProvider 内部使用");
  }
  return context;
};
