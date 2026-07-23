"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type OrderStatus = "已完成" | "待结算" | "已取消";
type ContactType = "兼职" | "客户";
type ProjectStatus = "进行中" | "暂停" | "结束";

type Order = {
  id: string;
  date: string;
  project: string;
  contactId: string;
  name: string;
  phone: string;
  source: string;
  income: number;
  salary: number;
  referralMember: string;
  referralFee: number;
  otherCost: number;
  owner: string;
  status: OrderStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  payee: string;
  owner: string;
  note: string;
};

type Contact = {
  id: string;
  name: string;
  phone: string;
  gender: "男" | "女" | "未知";
  contactType: ContactType;
  city: string;
  source: string;
  projects: string;
  rating: "A" | "B" | "C";
  tags: string;
  note: string;
};

type Member = {
  id: string;
  name: string;
  role: string;
  defaultReferralFee: number;
  note: string;
};

type Project = {
  id: string;
  name: string;
  category: string;
  settlement: number;
  wage: number;
  status: ProjectStatus;
  note: string;
};

type Review = {
  id: string;
  date: string;
  income: number;
  profit: number;
  batchCost: number;
  arrivals: number;
  conversions: number;
  best: string;
  problem: string;
  plan: string;
};

type Batch = {
  id: string;
  date: string;
  batchNo: string;
  channel: string;
  receiverWechat: string;
  account1: string;
  account2: string;
  accountCount: number;
  posts: number;
  cost: number;
  wechat: number;
  owner: string;
  note: string;
};

type LeadCohort = {
  id: string;
  leadDate: string;
  batchId: string;
  batchNo: string;
  member: string;
  receiverWechat: string;
  arrivals: number;
  consultations: number;
  note: string;
};

type ConversionResult = {
  id: string;
  leadCohortId: string;
  conversionDate: string;
  workDate: string;
  registered: number;
  completed: number;
  revenue: number;
  cost: number;
  note: string;
};

type DB = {
  orders: Order[];
  expenses: Expense[];
  contacts: Contact[];
  members: Member[];
  projects: Project[];
  reviews: Review[];
  batches: Batch[];
  leads: LeadCohort[];
  conversionResults: ConversionResult[];
};

type LegacyTraffic = {
  id?: string;
  date?: string;
  channel?: string;
  posts?: number;
  wechat?: number;
  consultations?: number;
  deals?: number;
  cost?: number;
  revenue?: number;
  note?: string;
};

type LegacyConversion = {
  id?: string;
  date?: string;
  member?: string;
  receiverWechat?: string;
  assignedWechat?: number;
  consultations?: number;
  deals?: number;
  revenue?: number;
  cost?: number;
  note?: string;
};

type ModalState = {
  type: string;
  id?: string;
  preset?: Record<string, string | number>;
} | null;

type DailyProfitDetail = {
  date: string;
  orders: Order[];
  batches: Batch[];
  expenses: Expense[];
  projects: Array<{
    project: string;
    revenue: number;
    salary: number;
    referralFee: number;
    otherCost: number;
    orderProfit: number;
  }>;
  grossRevenue: number;
  salaryCost: number;
  referralFees: number;
  otherDirectCost: number;
  batchCost: number;
  operatingExpenses: number;
  pureProfit: number;
  netMargin: number;
};

const STORAGE_KEY = "liangchen_v42";
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const isoNow = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (date: string, days: number) => {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return value.toISOString().slice(0, 10);
};
const money = (value: number) =>
  `¥${Number(value || 0).toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  })}`;
const percent = (value: number) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
const daysBetween = (from: string, to: string) => {
  if (!from || !to) return 0;
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.max(
    0,
    Math.floor(
      (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000,
    ),
  );
};
const splitNames = (name: string) =>
  name
    .split(/[、,，/；;]/)
    .map((item) => item.trim())
    .filter(Boolean);

const seed: DB = {
  orders: [
    {
      id: "o1",
      date: "2026-07-20",
      project: "星沙直播",
      contactId: "",
      name: "郑鑫、张东妹",
      phone: "",
      source: "自有名单",
      income: 700,
      salary: 350,
      referralMember: "",
      referralFee: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "两人合计，700-350=350",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    },
    {
      id: "o2",
      date: "2026-07-20",
      project: "好评",
      contactId: "",
      name: "刘鑫、尹润发",
      phone: "",
      source: "前天好评",
      income: 280,
      salary: 0,
      referralMember: "",
      referralFee: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "流量成本和哲立工资分别记录",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    },
    {
      id: "o3",
      date: "2026-07-21",
      project: "好评",
      contactId: "c1",
      name: "陈思晴",
      phone: "已脱敏",
      source: "昨日名单",
      income: 180,
      salary: 0,
      referralMember: "哲立",
      referralFee: 20,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "历史名单拆分示例",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    },
    {
      id: "o4",
      date: "2026-07-22",
      project: "岳麓APP",
      contactId: "c1",
      name: "陈思晴",
      phone: "已脱敏",
      source: "自有流量",
      income: 136.5,
      salary: 0,
      referralMember: "",
      referralFee: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "老兼职复购",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    },
    {
      id: "o5",
      date: "2026-07-23",
      project: "线上网店",
      contactId: "c1",
      name: "陈思晴",
      phone: "已脱敏",
      source: "复购用户",
      income: 260,
      salary: 100,
      referralMember: "",
      referralFee: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "260-100=160",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    },
    {
      id: "o6",
      date: "2026-07-21",
      project: "星沙APP",
      contactId: "c2",
      name: "刘鑫",
      phone: "",
      source: "自有流量",
      income: 169,
      salary: 0,
      referralMember: "",
      referralFee: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "130×1.3=169",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    },
  ],
  expenses: [
    {
      id: "e1",
      date: "2026-07-20",
      category: "员工工资",
      amount: 100,
      payee: "哲立",
      owner: "良辰",
      note: "7.20哲立工资",
    },
    {
      id: "e2",
      date: "2026-07-21",
      category: "员工工资",
      amount: 268,
      payee: "哲立",
      owner: "良辰",
      note: "7.21哲立工资",
    },
    {
      id: "e3",
      date: "2026-07-22",
      category: "员工工资",
      amount: 160,
      payee: "哲立",
      owner: "良辰",
      note: "7.22哲立工资",
    },
  ],
  contacts: [
    {
      id: "c1",
      name: "陈思晴",
      phone: "已脱敏",
      gender: "女",
      contactType: "兼职",
      city: "长沙",
      source: "好评名单",
      projects: "好评、岳麓APP、线上网店",
      rating: "A",
      tags: "高复购,执行稳定",
      note: "连续合作3次",
    },
    {
      id: "c2",
      name: "刘鑫",
      phone: "",
      gender: "未知",
      contactType: "兼职",
      city: "长沙",
      source: "自有名单",
      projects: "好评、星沙APP",
      rating: "A",
      tags: "多项目",
      note: "",
    },
  ],
  members: [
    {
      id: "m1",
      name: "良辰",
      role: "管理员",
      defaultReferralFee: 0,
      note: "主账号承接",
    },
    {
      id: "m2",
      name: "哲立",
      role: "核心徒弟",
      defaultReferralFee: 20,
      note: "主要转化成员",
    },
    {
      id: "m3",
      name: "徒弟B",
      role: "转化成员",
      defaultReferralFee: 20,
      note: "持续统计",
    },
  ],
  projects: [
    {
      id: "p1",
      name: "证券",
      category: "拉新",
      settlement: 130,
      wage: 40,
      status: "进行中",
      note: "不同卡类费用不同",
    },
    {
      id: "p2",
      name: "星沙直播",
      category: "直播充场",
      settlement: 350,
      wage: 150,
      status: "进行中",
      note: "",
    },
    {
      id: "p3",
      name: "好评",
      category: "线下任务",
      settlement: 180,
      wage: 0,
      status: "进行中",
      note: "按批次结算",
    },
    {
      id: "p4",
      name: "岳麓APP",
      category: "APP拉新",
      settlement: 136.5,
      wage: 0,
      status: "进行中",
      note: "按1.3系数结算",
    },
    {
      id: "p5",
      name: "线上网店",
      category: "线上任务",
      settlement: 260,
      wage: 100,
      status: "进行中",
      note: "",
    },
  ],
  reviews: [
    {
      id: "r1",
      date: "2026-07-20",
      income: 980,
      profit: 404,
      batchCost: 126,
      arrivals: 35,
      conversions: 4,
      best: "星沙直播和好评同时贡献",
      problem: "证券费用延迟结算，利润口径不完整",
      plan: "补齐待结算项目，分开记录收入与成本",
    },
    {
      id: "r2",
      date: "2026-07-21",
      income: 2353,
      profit: 1795,
      batchCost: 140,
      arrivals: 46,
      conversions: 13,
      best: "好评、证券、APP多项目并行",
      problem: "名单来源和项目成本分摊不够细",
      plan: "开始记录批次、来客日期、转化日期和做单日期",
    },
  ],
  batches: [
    {
      id: "b1",
      date: "2026-07-20",
      batchNo: "0720-A",
      channel: "小红书双号代发",
      receiverWechat: "良辰微信",
      account1: "历史账号A",
      account2: "历史账号B",
      accountCount: 2,
      posts: 2,
      cost: 126,
      wechat: 35,
      owner: "良辰",
      note: "由历史流量数据迁移",
    },
    {
      id: "b2",
      date: "2026-07-21",
      batchNo: "0721-A",
      channel: "小红书双号代发",
      receiverWechat: "良辰微信",
      account1: "历史账号A",
      account2: "历史账号B",
      accountCount: 2,
      posts: 2,
      cost: 140,
      wechat: 46,
      owner: "良辰",
      note: "由历史流量数据迁移",
    },
    {
      id: "b3",
      date: "2026-07-22",
      batchNo: "0722-A",
      channel: "小红书双号代发",
      receiverWechat: "良辰微信",
      account1: "历史账号A",
      account2: "历史账号B",
      accountCount: 2,
      posts: 2,
      cost: 90,
      wechat: 28,
      owner: "良辰",
      note: "由历史流量数据迁移",
    },
  ],
  leads: [
    {
      id: "l1",
      leadDate: "2026-07-21",
      batchId: "b2",
      batchNo: "0721-A",
      member: "良辰",
      receiverWechat: "良辰微信",
      arrivals: 46,
      consultations: 31,
      note: "历史批次",
    },
    {
      id: "l2",
      leadDate: "2026-07-22",
      batchId: "b3",
      batchNo: "0722-A",
      member: "良辰",
      receiverWechat: "良辰微信",
      arrivals: 28,
      consultations: 18,
      note: "历史批次",
    },
  ],
  conversionResults: [
    {
      id: "cr1",
      leadCohortId: "l1",
      conversionDate: "2026-07-21",
      workDate: "2026-07-22",
      registered: 13,
      completed: 13,
      revenue: 2353,
      cost: 558,
      note: "当天转化，次日做单",
    },
    {
      id: "cr2",
      leadCohortId: "l2",
      conversionDate: "2026-07-22",
      workDate: "2026-07-23",
      registered: 5,
      completed: 5,
      revenue: 638,
      cost: 250,
      note: "当天转化，次日做单",
    },
  ],
};

function normalizeDB(raw: unknown): DB {
  if (!raw || typeof raw !== "object") return seed;
  const source = raw as Record<string, unknown>;
  const legacyTraffic = Array.isArray(source.traffic)
    ? (source.traffic as LegacyTraffic[])
    : [];
  const legacyConversions = Array.isArray(source.conversions)
    ? (source.conversions as LegacyConversion[])
    : [];
  const oldTeam = Array.isArray(source.team)
    ? (source.team as Array<Record<string, unknown>>)
    : [];

  const batches: Batch[] =
    Array.isArray(source.batches) && source.batches.length > 0
      ? (source.batches as Batch[]).map((item) => ({
          ...item,
          accountCount: Number(item.accountCount || 0),
          posts: Number(item.posts || 0),
          cost: Number(item.cost || 0),
          wechat: Number(item.wechat || 0),
        }))
      : legacyTraffic.length > 0
        ? legacyTraffic.map((item, index) => ({
            id: item.id || `legacy_batch_${index}`,
            date: item.date || today(),
            batchNo: `历史-${item.date || index + 1}`,
            channel: item.channel || "历史流量",
            receiverWechat: "未记录",
            account1: "",
            account2: "",
            accountCount: (item.channel || "").includes("小红书") ? 2 : 0,
            posts: Number(item.posts || 0),
            cost: Number(item.cost || 0),
            wechat: Number(item.wechat || 0),
            owner: "良辰",
            note: item.note || "由旧版流量中心自动迁移",
          }))
        : seed.batches;

  const members: Member[] =
    Array.isArray(source.members) && source.members.length > 0
      ? (source.members as Array<Partial<Member>>).map((item, index) => ({
          id: String(item.id || `member_${index}`),
          name: String(item.name || `成员${index + 1}`),
          role: String(item.role || "转化成员"),
          defaultReferralFee: Number(item.defaultReferralFee || 0),
          note: String(item.note || ""),
        }))
      : oldTeam.length > 0
        ? oldTeam.map((item, index) => ({
            id: String(item.id || `legacy_member_${index}`),
            name: String(item.name || `成员${index + 1}`),
            role: String(item.role || "转化成员"),
            defaultReferralFee: 0,
            note: String(item.note || ""),
          }))
        : seed.members;

  const orders: Order[] = Array.isArray(source.orders)
    ? (source.orders as Array<Record<string, unknown>>).map((item, index) => ({
        id: String(item.id || `order_${index}`),
        date: String(item.date || today()),
        project: String(item.project || ""),
        contactId: String(item.contactId || ""),
        name: String(item.name || ""),
        phone: String(item.phone || ""),
        source: String(item.source || ""),
        income: Number(item.income || 0),
        salary: Number(item.salary || 0),
        referralMember: String(item.referralMember || ""),
        referralFee: Number(item.referralFee || 0),
        otherCost: Number(item.otherCost || item.trafficCost || 0),
        owner: String(item.owner || "良辰"),
        status: (item.status || "已完成") as OrderStatus,
        note: String(item.note || ""),
        createdAt: String(item.createdAt || isoNow()),
        updatedAt: String(item.updatedAt || isoNow()),
      }))
    : seed.orders;

  const contacts: Contact[] = Array.isArray(source.contacts)
    ? (source.contacts as Array<Partial<Contact>>).map((item, index) => ({
        id: String(item.id || `contact_${index}`),
        name: String(item.name || ""),
        phone: String(item.phone || ""),
        gender: (item.gender || "未知") as Contact["gender"],
        contactType: (item.contactType || "兼职") as ContactType,
        city: String(item.city || "长沙"),
        source: String(item.source || ""),
        projects: String(item.projects || ""),
        rating: (item.rating || "B") as Contact["rating"],
        tags: String(item.tags || ""),
        note: String(item.note || ""),
      }))
    : seed.contacts;

  let leads: LeadCohort[] = Array.isArray(source.leads)
    ? (source.leads as LeadCohort[])
    : [];
  let conversionResults: ConversionResult[] = Array.isArray(
    source.conversionResults,
  )
    ? (source.conversionResults as ConversionResult[])
    : [];

  if (leads.length === 0 && legacyConversions.length > 0) {
    leads = legacyConversions.map((item, index) => ({
      id: `lead_${item.id || index}`,
      leadDate: item.date || today(),
      batchId: "",
      batchNo: `历史承接-${item.date || index + 1}`,
      member: item.member || "良辰",
      receiverWechat: item.receiverWechat || "未记录",
      arrivals: Number(item.assignedWechat || 0),
      consultations: Number(item.consultations || 0),
      note: item.note || "由旧版承接记录自动迁移",
    }));
    conversionResults = legacyConversions.map((item, index) => ({
      id: `result_${item.id || index}`,
      leadCohortId: `lead_${item.id || index}`,
      conversionDate: item.date || today(),
      workDate: addDays(item.date || today(), 1),
      registered: Number(item.deals || 0),
      completed: Number(item.deals || 0),
      revenue: Number(item.revenue || 0),
      cost: Number(item.cost || 0),
      note: item.note || "由旧版承接记录自动迁移",
    }));
  }

  if (leads.length === 0 && batches.length > 0) {
    leads = batches.map((batch) => ({
      id: `lead_from_${batch.id}`,
      leadDate: batch.date,
      batchId: batch.id,
      batchNo: batch.batchNo,
      member: batch.owner,
      receiverWechat: batch.receiverWechat,
      arrivals: batch.wechat,
      consultations: 0,
      note: "由投放批次自动生成，咨询和转化待回填",
    }));
  }

  return {
    orders,
    expenses: Array.isArray(source.expenses)
      ? (source.expenses as Expense[])
      : seed.expenses,
    contacts,
    members,
    projects: Array.isArray(source.projects)
      ? (source.projects as Project[])
      : seed.projects,
    reviews: Array.isArray(source.reviews)
      ? (source.reviews as Array<Record<string, unknown>>).map(
          (item, index) => ({
            id: String(item.id || `review_${index}`),
            date: String(item.date || today()),
            income: Number(item.income || 0),
            profit: Number(item.profit || 0),
            batchCost: Number(item.batchCost || item.trafficCost || 0),
            arrivals: Number(item.arrivals || item.wechat || 0),
            conversions: Number(item.conversions || item.deals || 0),
            best: String(item.best || ""),
            problem: String(item.problem || ""),
            plan: String(item.plan || ""),
          }),
        )
      : seed.reviews,
    batches,
    leads,
    conversionResults,
  };
}

const navItems = [
  ["dashboard", "经营驾驶舱", "◫"],
  ["batches", "投放批次", "↗"],
  ["funnel", "来客转化", "⇄"],
  ["orders", "订单利润", "¥"],
  ["repeat", "老客复购", "★"],
  ["expenses", "费用中心", "￥"],
  ["crm", "兼职CRM", "◎"],
  ["members", "成员管理", "♟"],
  ["projects", "项目中心", "◆"],
  ["reviews", "每日复盘", "✓"],
  ["data", "数据管理", "⇩"],
] as const;

export default function Home() {
  const [db, setDb] = useState<DB>(seed);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<(typeof navItems)[number][0]>("dashboard");
  const [modal, setModal] = useState<ModalState>(null);
  const [query, setQuery] = useState("");
  const [analysisDate, setAnalysisDate] = useState(today());
  const [profitOpen, setProfitOpen] = useState(false);
  const [selectedProfitDate, setSelectedProfitDate] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = normalizeDB(JSON.parse(raw));
        setDb(parsed);
        const latestDate = [
          ...parsed.batches.map((item) => item.date),
          ...parsed.leads.map((item) => item.leadDate),
          ...parsed.conversionResults.map((item) => item.conversionDate),
        ]
          .filter(Boolean)
          .sort()
          .at(-1);
        if (latestDate) setAnalysisDate(latestDate);
      } catch {
        setDb(seed);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db, ready]);

  const orderProfit = (order: Order) =>
    order.income -
    order.salary -
    order.referralFee -
    order.otherCost;

  const totals = useMemo(() => {
    const orders = db.orders.filter((item) => item.status !== "已取消");
    const grossRevenue = orders.reduce((sum, item) => sum + item.income, 0);
    const salaryCost = orders.reduce((sum, item) => sum + item.salary, 0);
    const referralFees = orders.reduce(
      (sum, item) => sum + item.referralFee,
      0,
    );
    const otherDirectCost = orders.reduce(
      (sum, item) => sum + item.otherCost,
      0,
    );
    const batchCost = db.batches.reduce((sum, item) => sum + item.cost, 0);
    const operatingExpenses = db.expenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const pureProfit =
      grossRevenue -
      salaryCost -
      referralFees -
      otherDirectCost -
      batchCost -
      operatingExpenses;
    const arrivals = db.leads.reduce((sum, item) => sum + item.arrivals, 0);
    const consultations = db.leads.reduce(
      (sum, item) => sum + item.consultations,
      0,
    );
    const conversions = db.conversionResults.reduce(
      (sum, item) => sum + item.registered,
      0,
    );
    const completed = db.conversionResults.reduce(
      (sum, item) => sum + item.completed,
      0,
    );

    return {
      grossRevenue,
      salaryCost,
      referralFees,
      otherDirectCost,
      batchCost,
      operatingExpenses,
      pureProfit,
      arrivals,
      consultations,
      conversions,
      completed,
      netMargin: grossRevenue ? (pureProfit / grossRevenue) * 100 : 0,
      cac: arrivals ? batchCost / arrivals : 0,
      conversionRate: arrivals ? (conversions / arrivals) * 100 : 0,
      roi: batchCost ? pureProfit / batchCost : 0,
    };
  }, [db]);

  const profitByProject = useMemo(() => {
    const map = new Map<
      string,
      { project: string; revenue: number; directCost: number; profit: number }
    >();
    db.orders
      .filter((item) => item.status !== "已取消")
      .forEach((item) => {
        const current = map.get(item.project) || {
          project: item.project || "未分类",
          revenue: 0,
          directCost: 0,
          profit: 0,
        };
        current.revenue += item.income;
        current.directCost +=
          item.salary + item.referralFee + item.otherCost;
        current.profit += orderProfit(item);
        map.set(current.project, current);
      });
    return [...map.values()].sort((a, b) => b.profit - a.profit);
  }, [db.orders]);

  const referralBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    db.orders.forEach((item) => {
      if (!item.referralMember || item.referralFee <= 0) return;
      map.set(
        item.referralMember,
        (map.get(item.referralMember) || 0) + item.referralFee,
      );
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [db.orders]);

  const leadStats = useMemo(
    () =>
      db.leads.map((lead) => {
        const results = db.conversionResults.filter(
          (item) => item.leadCohortId === lead.id,
        );
        const registered = results.reduce(
          (sum, item) => sum + item.registered,
          0,
        );
        const completed = results.reduce(
          (sum, item) => sum + item.completed,
          0,
        );
        const revenue = results.reduce((sum, item) => sum + item.revenue, 0);
        const cost = results.reduce((sum, item) => sum + item.cost, 0);
        const sameDay = results
          .filter((item) => item.conversionDate === lead.leadDate)
          .reduce((sum, item) => sum + item.registered, 0);
        return {
          ...lead,
          results,
          registered,
          completed,
          revenue,
          cost,
          profit: revenue - cost,
          pending: Math.max(0, lead.arrivals - registered),
          consultationRate: lead.arrivals
            ? (lead.consultations / lead.arrivals) * 100
            : 0,
          cohortConversionRate: lead.arrivals
            ? (registered / lead.arrivals) * 100
            : 0,
          completionRate: registered ? (completed / registered) * 100 : 0,
          sameDayRate: lead.arrivals ? (sameDay / lead.arrivals) * 100 : 0,
          perLeadProfit: lead.arrivals ? (revenue - cost) / lead.arrivals : 0,
        };
      }),
    [db.leads, db.conversionResults],
  );

  const dayOperations = useMemo(() => {
    const tomorrow = addDays(analysisDate, 1);
    const arrivals = db.leads
      .filter((item) => item.leadDate === analysisDate)
      .reduce((sum, item) => sum + item.arrivals, 0);
    const consultations = db.leads
      .filter((item) => item.leadDate === analysisDate)
      .reduce((sum, item) => sum + item.consultations, 0);
    const conversions = db.conversionResults
      .filter((item) => item.conversionDate === analysisDate)
      .reduce((sum, item) => sum + item.registered, 0);
    const workCompleted = db.conversionResults
      .filter((item) => item.workDate === analysisDate)
      .reduce((sum, item) => sum + item.completed, 0);
    const tomorrowScheduled = db.conversionResults
      .filter((item) => item.workDate === tomorrow)
      .reduce((sum, item) => sum + item.registered, 0);
    return {
      arrivals,
      consultations,
      conversions,
      workCompleted,
      tomorrowScheduled,
    };
  }, [db.leads, db.conversionResults, analysisDate]);

  const memberCohortRanking = useMemo(() => {
    const map = new Map<
      string,
      {
        member: string;
        arrivals: number;
        consultations: number;
        registered: number;
        completed: number;
        revenue: number;
        cost: number;
      }
    >();
    leadStats
      .filter((item) => item.leadDate === analysisDate)
      .forEach((item) => {
        const current = map.get(item.member) || {
          member: item.member,
          arrivals: 0,
          consultations: 0,
          registered: 0,
          completed: 0,
          revenue: 0,
          cost: 0,
        };
        current.arrivals += item.arrivals;
        current.consultations += item.consultations;
        current.registered += item.registered;
        current.completed += item.completed;
        current.revenue += item.revenue;
        current.cost += item.cost;
        map.set(item.member, current);
      });
    return [...map.values()]
      .map((item) => {
        const profit = item.revenue - item.cost;
        return {
          ...item,
          profit,
          consultationRate: item.arrivals
            ? (item.consultations / item.arrivals) * 100
            : 0,
          conversionRate: item.arrivals
            ? (item.registered / item.arrivals) * 100
            : 0,
          completionRate: item.registered
            ? (item.completed / item.registered) * 100
            : 0,
          perLeadProfit: item.arrivals ? profit / item.arrivals : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [leadStats, analysisDate]);

  const repeatPool = useMemo(() => {
    return db.contacts
      .map((contact) => {
        const related = db.orders.filter((order) => {
          if (order.status === "已取消") return false;
          if (order.contactId && order.contactId === contact.id) return true;
          if (contact.phone && order.phone && contact.phone === order.phone)
            return true;
          return splitNames(order.name).includes(contact.name);
        });
        const completed = related.filter((item) => item.status === "已完成");
        const lastDate = completed
          .map((item) => item.date)
          .sort()
          .at(-1) || "";
        const projects = [...new Set(completed.map((item) => item.project))];
        const approximateProfit = completed.reduce((sum, item) => {
          const people = Math.max(1, splitNames(item.name).length);
          return sum + orderProfit(item) / people;
        }, 0);
        const inactiveDays = lastDate ? daysBetween(lastDate, today()) : 0;
        const label =
          completed.length >= 3
            ? "高频老客"
            : inactiveDays >= 7
              ? "待召回"
              : "活跃复购";
        return {
          contact,
          orderCount: completed.length,
          lastDate,
          projects,
          approximateProfit,
          inactiveDays,
          label,
        };
      })
      .filter((item) => item.orderCount >= 2)
      .sort((a, b) => {
        if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
        return b.lastDate.localeCompare(a.lastDate);
      });
  }, [db.contacts, db.orders]);

  const projectStats = useMemo(
    () =>
      db.projects.map((project) => {
        const orders = db.orders.filter(
          (order) =>
            order.project === project.name && order.status !== "已取消",
        );
        return {
          ...project,
          orders: orders.length,
          revenue: orders.reduce((sum, item) => sum + item.income, 0),
          profit: orders.reduce((sum, item) => sum + orderProfit(item), 0),
        };
      }),
    [db.projects, db.orders],
  );

  const dailyProfitDetails = useMemo<DailyProfitDetail[]>(() => {
    const dates = new Set<string>();
    db.orders.forEach((item) => {
      if (item.status !== "已取消") dates.add(item.date);
    });
    db.batches.forEach((item) => dates.add(item.date));
    db.expenses.forEach((item) => dates.add(item.date));

    return [...dates]
      .sort()
      .map((date) => {
        const orders = db.orders.filter(
          (item) => item.date === date && item.status !== "已取消",
        );
        const batches = db.batches.filter((item) => item.date === date);
        const expenses = db.expenses.filter((item) => item.date === date);
        const grossRevenue = orders.reduce(
          (sum, item) => sum + item.income,
          0,
        );
        const salaryCost = orders.reduce(
          (sum, item) => sum + item.salary,
          0,
        );
        const referralFees = orders.reduce(
          (sum, item) => sum + item.referralFee,
          0,
        );
        const otherDirectCost = orders.reduce(
          (sum, item) => sum + item.otherCost,
          0,
        );
        const batchCost = batches.reduce(
          (sum, item) => sum + item.cost,
          0,
        );
        const operatingExpenses = expenses.reduce(
          (sum, item) => sum + item.amount,
          0,
        );
        const pureProfit =
          grossRevenue -
          salaryCost -
          referralFees -
          otherDirectCost -
          batchCost -
          operatingExpenses;

        const projectMap = new Map<
          string,
          {
            project: string;
            revenue: number;
            salary: number;
            referralFee: number;
            otherCost: number;
            orderProfit: number;
          }
        >();

        orders.forEach((item) => {
          const key = item.project || "未分类";
          const current = projectMap.get(key) || {
            project: key,
            revenue: 0,
            salary: 0,
            referralFee: 0,
            otherCost: 0,
            orderProfit: 0,
          };
          current.revenue += item.income;
          current.salary += item.salary;
          current.referralFee += item.referralFee;
          current.otherCost += item.otherCost;
          current.orderProfit += orderProfit(item);
          projectMap.set(key, current);
        });

        return {
          date,
          orders,
          batches,
          expenses,
          projects: [...projectMap.values()].sort(
            (a, b) => b.orderProfit - a.orderProfit,
          ),
          grossRevenue,
          salaryCost,
          referralFees,
          otherDirectCost,
          batchCost,
          operatingExpenses,
          pureProfit,
          netMargin: grossRevenue ? (pureProfit / grossRevenue) * 100 : 0,
        };
      });
  }, [db.orders, db.batches, db.expenses]);

  const dailyProfit = useMemo(
    () =>
      dailyProfitDetails
        .map((item) => [item.date, item.pureProfit] as [string, number])
        .slice(-7),
    [dailyProfitDetails],
  );

  const selectedDailyProfit = selectedProfitDate
    ? dailyProfitDetails.find((item) => item.date === selectedProfitDate)
    : undefined;

  const filteredOrders = db.orders.filter((item) =>
    [
      item.name,
      item.phone,
      item.project,
      item.source,
      item.owner,
      item.referralMember,
      item.note,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const filteredContacts = db.contacts.filter((item) =>
    [
      item.name,
      item.phone,
      item.contactType,
      item.projects,
      item.tags,
      item.source,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  function open(
    type: string,
    id = "",
    preset: Record<string, string | number> = {},
  ) {
    setModal({ type, id, preset });
  }

  function remove(key: keyof DB, id: string) {
    if (!confirm("确认删除这条记录？")) return;
    setDb((previous) => ({
      ...previous,
      [key]: (previous[key] as Array<{ id: string }>).filter(
        (item) => item.id !== id,
      ),
    }));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(db, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `良辰运营中台备份_${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setDb(normalizeDB(JSON.parse(String(reader.result))));
        alert("导入成功");
      } catch {
        alert("文件格式错误");
      }
    };
    reader.readAsText(file);
  }

  function renderDashboard() {
    const maxProfit = Math.max(...dailyProfit.map(([, value]) => Math.abs(value)), 1);
    const bestProject = [...projectStats].sort(
      (a, b) => b.profit - a.profit,
    )[0];
    const bestRepeat = repeatPool[0];
    return (
      <>
        <div className="kpis">
          <Kpi
            label="累计纯利润"
            value={money(totals.pureProfit)}
            hint="点击查看完整收入构成"
            tone="profit"
            onClick={() => setProfitOpen(true)}
          />
          <Kpi
            label="企业结算总额"
            value={money(totals.grossRevenue)}
            hint={`${db.orders.length}条订单`}
          />
          <Kpi
            label="投放成本"
            value={money(totals.batchCost)}
            hint={`${db.batches.length}个批次`}
          />
          <Kpi
            label="累计来客"
            value={String(totals.arrivals)}
            hint={`单客成本 ${money(totals.cac)}`}
          />
          <Kpi
            label="最终转化率"
            value={percent(totals.conversionRate)}
            hint={`${totals.conversions}人报名`}
          />
          <Kpi
            label="综合ROI"
            value={totals.roi.toFixed(2)}
            hint="纯利润 ÷ 投放成本"
          />
        </div>

        <div className="grid-2">
          <section className="panel">
            <div className="panel-head chart-panel-head">
              <div>
                <h3>近7日纯利润趋势</h3>
                <p className="sub">
                  已扣兼职工资、徒弟送人费、投放成本和运营费用
                </p>
              </div>
              <span className="chart-tip">点击任意一天查看利润组成</span>
            </div>
            <div className="mini-chart">
              {dailyProfit.map(([date, value]) => (
                <div className="bar-wrap" key={date}>
                  <button
                    type="button"
                    className="bar-button"
                    onClick={() => setSelectedProfitDate(date)}
                    aria-label={`查看${date}纯利润组成`}
                    title="点击查看当天纯利润组成"
                  >
                    <div
                      className={`bar ${value >= 0 ? "profit" : "loss"}`}
                      style={{
                        height: `${Math.max(
                          7,
                          Math.abs(value) / maxProfit * 150,
                        )}px`,
                      }}
                    >
                      <span>{value.toFixed(0)}</span>
                    </div>
                    <div className="bar-label">{date.slice(5)}</div>
                    <div className="bar-open-hint">查看明细</div>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>经营结论</h3>
                <p className="sub">基于当前数据自动判断</p>
              </div>
            </div>
            <div className="metric-list">
              <Metric
                label="净利率"
                value={percent(totals.netMargin)}
              />
              <Metric
                label="最高利润项目"
                value={
                  bestProject
                    ? `${bestProject.name} · ${money(bestProject.profit)}`
                    : "暂无"
                }
              />
              <Metric
                label="做单最多老兼职"
                value={
                  bestRepeat
                    ? `${bestRepeat.contact.name} · ${bestRepeat.orderCount}单`
                    : "待积累"
                }
              />
              <Metric
                label="徒弟送人费"
                value={money(totals.referralFees)}
              />
            </div>
          </section>
        </div>

        <div className="grid-3">
          <section className="panel">
            <h3>纯利润扣除项</h3>
            <div className="metric-list section-gap">
              <Metric label="兼职工资" value={money(totals.salaryCost)} />
              <Metric label="徒弟送人费" value={money(totals.referralFees)} />
              <Metric
                label="其他直接成本"
                value={money(totals.otherDirectCost)}
              />
              <Metric label="投放成本" value={money(totals.batchCost)} />
              <Metric
                label="运营费用"
                value={money(totals.operatingExpenses)}
              />
            </div>
          </section>

          <section className="panel">
            <h3>{analysisDate} 业务节奏</h3>
            <div className="metric-list section-gap">
              <Metric
                label="当天来客"
                value={`${dayOperations.arrivals}人`}
              />
              <Metric
                label="当天转化"
                value={`${dayOperations.conversions}人`}
              />
              <Metric
                label="当天做单"
                value={`${dayOperations.workCompleted}人`}
              />
              <Metric
                label="次日待做"
                value={`${dayOperations.tomorrowScheduled}人`}
              />
            </div>
          </section>

          <section className="panel">
            <h3>系统提醒</h3>
            <div className="notice section-gap">
              来客、转化和做单已拆成三个日期。今天来的人可以今天报名、明天做单，转化率仍归到原来客批次，不会被日期错位干扰。
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderBatches() {
    const grouped = [...db.batches]
      .sort((a, b) => b.date.localeCompare(a.date))
      .reduce<Record<string, Batch[]>>((map, item) => {
        (map[item.date] ||= []).push(item);
        return map;
      }, {});

    const dailyGroups = Object.entries(grouped).map(([date, items]) => {
      const cost = items.reduce((sum, item) => sum + item.cost, 0);
      const arrivals = items.reduce((sum, item) => sum + item.wechat, 0);
      const posts = items.reduce((sum, item) => sum + item.posts, 0);

      const accountMap = new Map<
        string,
        {
          name: string;
          owner: string;
          arrivals: number;
          cost: number;
          posts: number;
          batches: number;
          channels: Set<string>;
        }
      >();

      items.forEach((item) => {
        const name = item.receiverWechat || "未记录承接微信";
        const current = accountMap.get(name) || {
          name,
          owner: item.owner || "未记录",
          arrivals: 0,
          cost: 0,
          posts: 0,
          batches: 0,
          channels: new Set<string>(),
        };
        current.arrivals += item.wechat;
        current.cost += item.cost;
        current.posts += item.posts;
        current.batches += 1;
        current.channels.add(item.channel);
        accountMap.set(name, current);
      });

      const accounts = [...accountMap.values()].sort(
        (a, b) => b.arrivals - a.arrivals,
      );

      return {
        date,
        items,
        cost,
        arrivals,
        posts,
        accounts,
        cac: arrivals ? cost / arrivals : 0,
      };
    });

    const latestDate = dailyGroups[0]?.date;

    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>投放批次中心</h3>
            <p className="sub">
              先看每天总成本和总来客，再展开查看每个承接微信分别来了多少人
            </p>
          </div>
          <button className="btn primary" onClick={() => open("batch") }>
            ＋新增批次
          </button>
        </div>

        <div className="summary-strip">
          <Summary label="累计批次" value={`${db.batches.length}个`} />
          <Summary label="累计投放成本" value={money(totals.batchCost)} />
          <Summary
            label="累计批次来客"
            value={`${db.batches.reduce((sum, item) => sum + item.wechat, 0)}人`}
          />
          <Summary label="已登记来客" value={`${totals.arrivals}人`} />
          <Summary label="累计单客成本" value={money(totals.cac)} />
        </div>

        {dailyGroups.length === 0 ? (
          <div className="empty">
            暂无投放批次。点击右上角“新增批次”开始记录。
          </div>
        ) : (
          <div className="daily-batch-list">
            {dailyGroups.map((group) => {
              const maxAccountArrivals = Math.max(
                ...group.accounts.map((account) => account.arrivals),
                1,
              );

              return (
                <details
                  className="daily-batch-group"
                  key={group.date}
                  open={group.date === latestDate}
                >
                  <summary className="daily-batch-summary">
                    <div className="daily-batch-date">
                      <strong>{group.date}</strong>
                      <span>
                        {group.items.length}个批次 · {group.accounts.length}个承接微信
                      </span>
                    </div>
                    <div className="daily-batch-kpis">
                      <div>
                        <span>当天来客</span>
                        <strong>{group.arrivals}人</strong>
                      </div>
                      <div>
                        <span>当天成本</span>
                        <strong>{money(group.cost)}</strong>
                      </div>
                      <div>
                        <span>单客成本</span>
                        <strong>{money(group.cac)}</strong>
                      </div>
                      <div>
                        <span>发布帖子</span>
                        <strong>{group.posts}篇</strong>
                      </div>
                    </div>
                    <span className="daily-batch-toggle">展开账号明细</span>
                  </summary>

                  <div className="daily-batch-content">
                    <div className="account-flow-head">
                      <div>
                        <h4>承接微信来客分布</h4>
                        <p>
                          按当天实际来客从高到低排列，直接判断哪些微信承接量更高
                        </p>
                      </div>
                      <span>
                        日合计：{group.arrivals}人 / {money(group.cost)}
                      </span>
                    </div>

                    <div className="account-flow-grid">
                      {group.accounts.map((account, index) => {
                        const share = group.arrivals
                          ? (account.arrivals / group.arrivals) * 100
                          : 0;
                        const accountCac = account.arrivals
                          ? account.cost / account.arrivals
                          : 0;

                        return (
                          <div className="account-flow-card" key={account.name}>
                            <div className="account-flow-title">
                              <div>
                                <span className={`account-rank rank-${index + 1}`}>
                                  {index + 1}
                                </span>
                                <strong>{account.name}</strong>
                              </div>
                              <small>{account.owner}</small>
                            </div>

                            <div className="account-flow-number">
                              <strong>{account.arrivals}</strong>
                              <span>人来客</span>
                            </div>

                            <div className="account-flow-meter">
                              <i
                                style={{
                                  width: `${Math.max(
                                    4,
                                    account.arrivals /
                                      maxAccountArrivals *
                                      100,
                                  )}%`,
                                }}
                              />
                            </div>

                            <div className="account-flow-stats">
                              <div>
                                <span>当天占比</span>
                                <strong>{percent(share)}</strong>
                              </div>
                              <div>
                                <span>投放成本</span>
                                <strong>{money(account.cost)}</strong>
                              </div>
                              <div>
                                <span>单客成本</span>
                                <strong>{money(accountCac)}</strong>
                              </div>
                              <div>
                                <span>批次/帖子</span>
                                <strong>
                                  {account.batches} / {account.posts}
                                </strong>
                              </div>
                            </div>

                            <div className="account-flow-channel">
                              {[...account.channels].join("、") || "未记录方式"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="daily-detail-title">
                      <div>
                        <h4>当天批次明细</h4>
                        <p>需要修改成本或来客时，直接在对应批次点击编辑</p>
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>批次</th>
                            <th>方式</th>
                            <th>承接微信</th>
                            <th>账号组合</th>
                            <th>帖子</th>
                            <th>成本</th>
                            <th>来客</th>
                            <th>单客成本</th>
                            <th>负责人</th>
                            <th>备注</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.batchNo}</td>
                              <td>{item.channel}</td>
                              <td>
                                <strong>{item.receiverWechat || "未记录"}</strong>
                              </td>
                              <td>
                                {[item.account1, item.account2]
                                  .filter(Boolean)
                                  .join(" + ") || "—"}
                              </td>
                              <td>{item.posts}</td>
                              <td>{money(item.cost)}</td>
                              <td>
                                <strong className="money-pos">
                                  {item.wechat}人
                                </strong>
                              </td>
                              <td>
                                {money(item.wechat ? item.cost / item.wechat : 0)}
                              </td>
                              <td>{item.owner}</td>
                              <td>{item.note || "—"}</td>
                              <td>
                                <button
                                  className="btn sm"
                                  onClick={() => open("batch", item.id)}
                                >
                                  编辑
                                </button>{" "}
                                <button
                                  className="btn sm"
                                  onClick={() =>
                                    open("lead", "", {
                                      leadDate: item.date,
                                      batchId: item.id,
                                      batchNo: item.batchNo,
                                      member: item.owner,
                                      receiverWechat: item.receiverWechat,
                                      arrivals: item.wechat,
                                    })
                                  }
                                >
                                  登记来客
                                </button>{" "}
                                <button
                                  className="btn sm danger"
                                  onClick={() => remove("batches", item.id)}
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>
    );
  }


  function renderFunnel() {
    const tomorrow = addDays(analysisDate, 1);
    return (
      <>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>来客与延迟转化</h3>
              <p className="sub">
                先登记哪天来的人，再回填哪天报名、哪天实际做单
              </p>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => open("lead") }>
                ＋登记来客
              </button>
              <button className="btn primary" onClick={() => open("result") }>
                ＋回填转化/做单
              </button>
            </div>
          </div>
          <div className="date-filter">
            <label>查看日期</label>
            <input
              type="date"
              value={analysisDate}
              onChange={(event) => setAnalysisDate(event.target.value)}
            />
          </div>
          <div className="summary-strip">
            <Summary label="当天来客" value={`${dayOperations.arrivals}人`} />
            <Summary
              label="有效咨询"
              value={`${dayOperations.consultations}人`}
            />
            <Summary
              label="当天报名"
              value={`${dayOperations.conversions}人`}
            />
            <Summary
              label="当天做单"
              value={`${dayOperations.workCompleted}人`}
            />
            <Summary
              label={`${tomorrow.slice(5)}待做`}
              value={`${dayOperations.tomorrowScheduled}人`}
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>{analysisDate} 来客归因效率</h3>
              <p className="sub">
                即使转化发生在第二天，仍归回原来客日期计算最终转化率
              </p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>负责人</th>
                  <th>来客</th>
                  <th>咨询</th>
                  <th>咨询率</th>
                  <th>最终报名</th>
                  <th>最终转化率</th>
                  <th>完成做单</th>
                  <th>完成率</th>
                  <th>贡献利润</th>
                  <th>单客利润</th>
                </tr>
              </thead>
              <tbody>
                {memberCohortRanking.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty">这一天暂无来客登记。</div>
                    </td>
                  </tr>
                ) : (
                  memberCohortRanking.map((item, index) => (
                    <tr key={item.member}>
                      <td>
                        <span className={`rank rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td><strong>{item.member}</strong></td>
                      <td>{item.arrivals}</td>
                      <td>{item.consultations}</td>
                      <td>{percent(item.consultationRate)}</td>
                      <td>{item.registered}</td>
                      <td>{percent(item.conversionRate)}</td>
                      <td>{item.completed}</td>
                      <td>{percent(item.completionRate)}</td>
                      <td className={item.profit >= 0 ? "money-pos" : "money-neg"}>
                        {money(item.profit)}
                      </td>
                      <td>{money(item.perLeadProfit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>来客批次明细</h3>
              <p className="sub">
                “待转化”会随着后续回填自动减少，历史转化率会持续更新
              </p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>来客日期</th>
                  <th>负责人</th>
                  <th>承接微信</th>
                  <th>投放批次</th>
                  <th>来客</th>
                  <th>咨询</th>
                  <th>报名</th>
                  <th>待转化</th>
                  <th>最终转化率</th>
                  <th>当天转化率</th>
                  <th>做单完成</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {[...leadStats]
                  .sort((a, b) => b.leadDate.localeCompare(a.leadDate))
                  .map((item) => (
                    <tr key={item.id}>
                      <td>{item.leadDate}</td>
                      <td>{item.member}</td>
                      <td>{item.receiverWechat}</td>
                      <td>{item.batchNo || "—"}</td>
                      <td>{item.arrivals}</td>
                      <td>{item.consultations}</td>
                      <td>{item.registered}</td>
                      <td>{item.pending}</td>
                      <td>{percent(item.cohortConversionRate)}</td>
                      <td>{percent(item.sameDayRate)}</td>
                      <td>{item.completed}</td>
                      <td>
                        <button
                          className="btn sm"
                          onClick={() => open("lead", item.id)}
                        >
                          编辑来客
                        </button>{" "}
                        <button
                          className="btn sm primary"
                          onClick={() =>
                            open("result", "", {
                              leadCohortId: item.id,
                              conversionDate: today(),
                              workDate: addDays(today(), 1),
                            })
                          }
                        >
                          回填转化
                        </button>{" "}
                        <button
                          className="btn sm danger"
                          onClick={() => remove("leads", item.id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>转化与做单回填</h3>
              <p className="sub">
                报名日期和做单日期分开，完成数量可以后续继续编辑
              </p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>来客批次</th>
                  <th>负责人</th>
                  <th>来客日期</th>
                  <th>报名日期</th>
                  <th>做单日期</th>
                  <th>报名人数</th>
                  <th>完成人数</th>
                  <th>归因收入</th>
                  <th>成本</th>
                  <th>利润</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {[...db.conversionResults]
                  .sort((a, b) => b.conversionDate.localeCompare(a.conversionDate))
                  .map((item) => {
                    const lead = db.leads.find(
                      (entry) => entry.id === item.leadCohortId,
                    );
                    const profit = item.revenue - item.cost;
                    return (
                      <tr key={item.id}>
                        <td>{lead?.batchNo || "未关联"}</td>
                        <td>{lead?.member || "—"}</td>
                        <td>{lead?.leadDate || "—"}</td>
                        <td>{item.conversionDate}</td>
                        <td>{item.workDate}</td>
                        <td>{item.registered}</td>
                        <td>{item.completed}</td>
                        <td>{money(item.revenue)}</td>
                        <td>{money(item.cost)}</td>
                        <td className={profit >= 0 ? "money-pos" : "money-neg"}>
                          {money(profit)}
                        </td>
                        <td>
                          <button
                            className="btn sm"
                            onClick={() => open("result", item.id)}
                          >
                            编辑
                          </button>{" "}
                          <button
                            className="btn sm danger"
                            onClick={() =>
                              remove("conversionResults", item.id)
                            }
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderOrders() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>订单利润中心</h3>
            <p className="sub">
              选择老兼职和项目后自动带出信息；徒弟送人费直接扣入订单纯利润
            </p>
          </div>
          <button className="btn primary" onClick={() => open("order") }>
            ＋快速记一单
          </button>
        </div>
        <div className="order-help">
          <span>①选兼职</span>
          <span>②选项目自动带金额</span>
          <span>③选送人徒弟自动带默认费用</span>
          <span>④保存后仍可编辑或复制再做一单</span>
        </div>
        <div className="toolbar">
          <input
            className="search"
            placeholder="搜索姓名、电话、项目、徒弟、来源…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>做单日期</th>
                <th>项目</th>
                <th>兼职/客户</th>
                <th>来源</th>
                <th>企业结算</th>
                <th>兼职工资</th>
                <th>送人徒弟</th>
                <th>送人费</th>
                <th>其他成本</th>
                <th>订单纯利润</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredOrders]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((item) => (
                  <tr
                    key={item.id}
                    className="editable-row"
                    onDoubleClick={() => open("order", item.id)}
                    title="双击整行也可以编辑"
                  >
                    <td>{item.date}</td>
                    <td>{item.project}</td>
                    <td>
                      <strong>{item.name}</strong>
                      <small>{item.phone || ""}</small>
                    </td>
                    <td>{item.source || "—"}</td>
                    <td>{money(item.income)}</td>
                    <td>{money(item.salary)}</td>
                    <td>{item.referralMember || "直招"}</td>
                    <td>{money(item.referralFee)}</td>
                    <td>{money(item.otherCost)}</td>
                    <td className={orderProfit(item) >= 0 ? "money-pos" : "money-neg"}>
                      {money(orderProfit(item))}
                    </td>
                    <td>
                      <span className={`tag ${item.status === "待结算" ? "warn" : "a"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn sm"
                        onClick={() => open("order", item.id)}
                      >
                        编辑
                      </button>{" "}
                      <button
                        className="btn sm"
                        onClick={() =>
                          open("order", "", {
                            date: today(),
                            project: item.project,
                            contactId: item.contactId,
                            name: item.name,
                            phone: item.phone,
                            source: "老客复购",
                            owner: item.owner,
                          })
                        }
                      >
                        再做一单
                      </button>{" "}
                      <button
                        className="btn sm danger"
                        onClick={() => remove("orders", item.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderRepeat() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>老客户与老兼职自动筛选</h3>
            <p className="sub">
              完成2单自动进入复购池；按做单次数、最近日期和可召回状态排序
            </p>
          </div>
        </div>
        <div className="summary-strip">
          <Summary label="复购池人数" value={`${repeatPool.length}人`} />
          <Summary
            label="高频老客"
            value={`${repeatPool.filter((item) => item.orderCount >= 3).length}人`}
          />
          <Summary
            label="待召回"
            value={`${repeatPool.filter((item) => item.inactiveDays >= 7).length}人`}
          />
          <Summary
            label="最高做单次数"
            value={`${repeatPool[0]?.orderCount || 0}单`}
          />
          <Summary label="筛选规则" value="≥2单自动进入" />
        </div>
        <div className="repeat-grid">
          {repeatPool.length === 0 ? (
            <div className="empty panel-span">暂无完成2单以上的老客。</div>
          ) : (
            repeatPool.map((item) => (
              <div className="repeat-card" key={item.contact.id}>
                <div className="repeat-head">
                  <div className="member-avatar">
                    {item.contact.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4>{item.contact.name}</h4>
                    <span>
                      {item.contact.contactType} · {item.contact.rating}级
                    </span>
                  </div>
                  <span className={`tag ${item.label === "待召回" ? "warn" : "a"}`}>
                    {item.label}
                  </span>
                </div>
                <div className="repeat-metrics">
                  <Metric label="完成订单" value={`${item.orderCount}单`} />
                  <Metric label="最后做单" value={item.lastDate || "—"} />
                  <Metric
                    label="关联利润"
                    value={money(item.approximateProfit)}
                  />
                  <Metric
                    label="距今"
                    value={`${item.inactiveDays}天`}
                  />
                </div>
                <p>{item.projects.join("、") || "暂无项目记录"}</p>
                <div className="actions">
                  <button
                    className="btn primary"
                    onClick={() =>
                      open("order", "", {
                        date: today(),
                        contactId: item.contact.id,
                        name: item.contact.name,
                        phone: item.contact.phone,
                        source: "老客复购",
                      })
                    }
                  >
                    快速开单
                  </button>
                  <button
                    className="btn"
                    onClick={() => open("contact", item.contact.id)}
                  >
                    查看资料
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  function renderExpenses() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>费用中心</h3>
            <p className="sub">员工工资、客服工资、办公费等运营支出</p>
          </div>
          <button className="btn primary" onClick={() => open("expense") }>
            ＋新增费用
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>费用类型</th>
                <th>金额</th>
                <th>收款人</th>
                <th>负责人</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {db.expenses.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.category}</td>
                  <td className="money-neg">{money(item.amount)}</td>
                  <td>{item.payee}</td>
                  <td>{item.owner}</td>
                  <td>{item.note}</td>
                  <td>
                    <button
                      className="btn sm"
                      onClick={() => open("expense", item.id)}
                    >
                      编辑
                    </button>{" "}
                    <button
                      className="btn sm danger"
                      onClick={() => remove("expenses", item.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderCRM() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>兼职与客户CRM</h3>
            <p className="sub">
              维护联系人类型、历史项目、评级和召回标签
            </p>
          </div>
          <button className="btn primary" onClick={() => open("contact") }>
            ＋新增联系人
          </button>
        </div>
        <div className="toolbar">
          <input
            className="search"
            placeholder="搜索姓名、电话、客户类型、标签…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>类型</th>
                <th>电话/微信</th>
                <th>城市</th>
                <th>来源</th>
                <th>做过项目</th>
                <th>评级</th>
                <th>标签</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><span className="tag b">{item.contactType}</span></td>
                  <td>{item.phone || "—"}</td>
                  <td>{item.city}</td>
                  <td>{item.source}</td>
                  <td>{item.projects}</td>
                  <td><span className={`tag ${item.rating === "A" ? "a" : "b"}`}>{item.rating}级</span></td>
                  <td>
                    {item.tags
                      .split(",")
                      .filter(Boolean)
                      .map((tag) => (
                        <span className="tag" key={tag}>{tag}</span>
                      ))}
                  </td>
                  <td>
                    <button
                      className="btn sm"
                      onClick={() => open("contact", item.id)}
                    >
                      编辑
                    </button>{" "}
                    <button
                      className="btn sm primary"
                      onClick={() =>
                        open("order", "", {
                          contactId: item.id,
                          name: item.name,
                          phone: item.phone,
                          source: "CRM复购",
                        })
                      }
                    >
                      开单
                    </button>{" "}
                    <button
                      className="btn sm danger"
                      onClick={() => remove("contacts", item.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderMembers() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>成员与默认送人费</h3>
            <p className="sub">
              设置徒弟默认送人费用，订单选择成员后自动带入
            </p>
          </div>
          <button className="btn primary" onClick={() => open("member") }>
            ＋新增成员
          </button>
        </div>
        <div className="member-grid">
          {db.members.map((item) => {
            const referredOrders = db.orders.filter(
              (order) => order.referralMember === item.name,
            );
            const referralTotal = referredOrders.reduce(
              (sum, order) => sum + order.referralFee,
              0,
            );
            const ownedLeads = leadStats.filter(
              (lead) => lead.member === item.name,
            );
            const arrivals = ownedLeads.reduce(
              (sum, lead) => sum + lead.arrivals,
              0,
            );
            const converted = ownedLeads.reduce(
              (sum, lead) => sum + lead.registered,
              0,
            );
            return (
              <div className="member-card" key={item.id}>
                <div className="member-title">
                  <div className="member-avatar">{item.name.slice(0, 1)}</div>
                  <div>
                    <h4>{item.name}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
                <div className="member-metrics">
                  <Metric
                    label="默认送人费"
                    value={money(item.defaultReferralFee)}
                  />
                  <Metric label="累计送人费" value={money(referralTotal)} />
                  <Metric label="累计来客" value={`${arrivals}人`} />
                  <Metric
                    label="最终转化率"
                    value={percent(arrivals ? converted / arrivals * 100 : 0)}
                  />
                </div>
                <p>{item.note || "暂无备注"}</p>
                <div className="actions">
                  <button
                    className="btn sm"
                    onClick={() => open("member", item.id)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn sm danger"
                    onClick={() => remove("members", item.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  function renderProjects() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>项目中心</h3>
            <p className="sub">
              项目参考结算和工资会自动带入新订单
            </p>
          </div>
          <button className="btn primary" onClick={() => open("project") }>
            ＋新增项目
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>项目</th>
                <th>类型</th>
                <th>参考结算</th>
                <th>参考工资</th>
                <th>订单数</th>
                <th>企业结算</th>
                <th>订单利润</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {projectStats.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{money(item.settlement)}</td>
                  <td>{money(item.wage)}</td>
                  <td>{item.orders}</td>
                  <td>{money(item.revenue)}</td>
                  <td className={item.profit >= 0 ? "money-pos" : "money-neg"}>
                    {money(item.profit)}
                  </td>
                  <td><span className={`tag ${item.status === "进行中" ? "a" : "warn"}`}>{item.status}</span></td>
                  <td>
                    <button
                      className="btn sm"
                      onClick={() => open("project", item.id)}
                    >
                      编辑
                    </button>{" "}
                    <button
                      className="btn sm danger"
                      onClick={() => remove("projects", item.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderReviews() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>每日经营复盘</h3>
            <p className="sub">保存真实纯利润、来客、转化和次日安排</p>
          </div>
          <button className="btn primary" onClick={() => open("review") }>
            ＋新增复盘
          </button>
        </div>
        {[...db.reviews]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((item) => (
            <div className="review-card" key={item.id}>
              <div className="panel-head">
                <div>
                  <h4>{item.date} 经营复盘</h4>
                  <div className="review-meta">
                    <span>收入 {money(item.income)}</span>
                    <span>纯利润 {money(item.profit)}</span>
                    <span>投放成本 {money(item.batchCost)}</span>
                    <span>来客 {item.arrivals}</span>
                    <span>转化 {item.conversions}</span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn sm"
                    onClick={() => open("review", item.id)}
                  >
                    编辑
                  </button>{" "}
                  <button
                    className="btn sm danger"
                    onClick={() => remove("reviews", item.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="review-text">
                <div><b>最佳渠道/项目</b>{item.best}</div>
                <div><b>主要问题</b>{item.problem}</div>
                <div><b>明日调整</b>{item.plan}</div>
              </div>
            </div>
          ))}
      </section>
    );
  }

  function renderData() {
    return (
      <div className="grid-2">
        <section className="panel">
          <h3>备份与迁移</h3>
          <p className="sub">
            当前仍是浏览器本地存储版。更新页面不会清空数据，但请定期备份。
          </p>
          <div className="actions section-gap">
            <button className="btn primary" onClick={exportData}>
              导出全部数据
            </button>
            <button className="btn" onClick={() => importRef.current?.click()}>
              导入备份
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importData(file);
              }}
            />
          </div>
        </section>
        <section className="panel">
          <h3>恢复初始化数据</h3>
          <p className="sub">会覆盖当前数据，操作前请先导出备份。</p>
          <button
            className="btn danger section-gap"
            onClick={() => {
              if (confirm("确定覆盖当前数据？")) setDb(seed);
            }}
          >
            恢复示例数据
          </button>
        </section>
      </div>
    );
  }

  const currentTitle =
    navItems.find(([id]) => id === tab)?.[1] || "经营驾驶舱";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">良</div>
          <div>
            <h1>良辰运营中台</h1>
            <small>FLOW OPERATIONS V4.7</small>
          </div>
        </div>
        <div className="nav">
          {navItems.map(([id, label, icon]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id);
                setQuery("");
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <div className="side-bottom">
          <div className="side-card">
            点击绿色“累计纯利润”查看收入构成
            <br />
            订单保存后仍可编辑和复制
            <br />
            请定期导出备份
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="title">
            <h2>{currentTitle}</h2>
            <p>
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
          <div className="actions">
            <button className="btn" onClick={exportData}>导出备份</button>
            <button className="btn" onClick={() => open("lead")}>＋登记来客</button>
            <button className="btn primary" onClick={() => open("order")}>＋快速记一单</button>
          </div>
        </div>

        {tab === "dashboard" && renderDashboard()}
        {tab === "batches" && renderBatches()}
        {tab === "funnel" && renderFunnel()}
        {tab === "orders" && renderOrders()}
        {tab === "repeat" && renderRepeat()}
        {tab === "expenses" && renderExpenses()}
        {tab === "crm" && renderCRM()}
        {tab === "members" && renderMembers()}
        {tab === "projects" && renderProjects()}
        {tab === "reviews" && renderReviews()}
        {tab === "data" && renderData()}
      </main>

      {modal && (
        <EditorModal
          modal={modal}
          db={db}
          setDb={setDb}
          close={() => setModal(null)}
        />
      )}

      {profitOpen && (
        <ProfitBreakdownModal
          totals={totals}
          projects={profitByProject}
          referrals={referralBreakdown}
          close={() => setProfitOpen(false)}
        />
      )}

      {selectedDailyProfit && (
        <DailyProfitBreakdownModal
          detail={selectedDailyProfit}
          close={() => setSelectedProfitDate(null)}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "default",
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "profit";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`kpi ${tone === "profit" ? "kpi-profit" : ""} ${
        onClick ? "kpi-clickable" : ""
      }`}
      onClick={onClick}
    >
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="hint">{hint}</div>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`field ${className}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ProfitBreakdownModal({
  totals,
  projects,
  referrals,
  close,
}: {
  totals: {
    grossRevenue: number;
    salaryCost: number;
    referralFees: number;
    otherDirectCost: number;
    batchCost: number;
    operatingExpenses: number;
    pureProfit: number;
    netMargin: number;
  };
  projects: Array<{
    project: string;
    revenue: number;
    directCost: number;
    profit: number;
  }>;
  referrals: Array<[string, number]>;
  close: () => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <div className="modal profit-modal">
        <div className="modal-head">
          <div>
            <h3>纯利润构成</h3>
            <p className="sub">不重复计算归因收入，只按真实结算减去全部成本</p>
          </div>
          <button className="close" onClick={close}>×</button>
        </div>
        <div className="profit-equation">
          <div><span>企业结算</span><strong>{money(totals.grossRevenue)}</strong></div>
          <b>−</b>
          <div><span>兼职工资</span><strong>{money(totals.salaryCost)}</strong></div>
          <b>−</b>
          <div><span>徒弟送人费</span><strong>{money(totals.referralFees)}</strong></div>
          <b>−</b>
          <div><span>其他直接成本</span><strong>{money(totals.otherDirectCost)}</strong></div>
          <b>−</b>
          <div><span>投放成本</span><strong>{money(totals.batchCost)}</strong></div>
          <b>−</b>
          <div><span>运营费用</span><strong>{money(totals.operatingExpenses)}</strong></div>
          <b>=</b>
          <div className="profit-result"><span>累计纯利润</span><strong>{money(totals.pureProfit)}</strong></div>
        </div>
        <div className="grid-2 section-gap">
          <section className="inner-panel">
            <h4>项目收入构成</h4>
            <div className="table-wrap compact-table">
              <table>
                <thead><tr><th>项目</th><th>结算</th><th>直接成本</th><th>订单利润</th></tr></thead>
                <tbody>
                  {projects.map((item) => (
                    <tr key={item.project}>
                      <td>{item.project}</td>
                      <td>{money(item.revenue)}</td>
                      <td>{money(item.directCost)}</td>
                      <td className={item.profit >= 0 ? "money-pos" : "money-neg"}>{money(item.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="inner-panel">
            <h4>徒弟送人费用</h4>
            <div className="metric-list">
              {referrals.length === 0 ? (
                <div className="empty">暂无送人费用</div>
              ) : (
                referrals.map(([name, amount]) => (
                  <Metric key={name} label={name} value={money(amount)} />
                ))
              )}
              <Metric label="当前净利率" value={percent(totals.netMargin)} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


function DailyProfitBreakdownModal({
  detail,
  close,
}: {
  detail: DailyProfitDetail;
  close: () => void;
}) {
  const totalDeductions =
    detail.salaryCost +
    detail.referralFees +
    detail.otherDirectCost +
    detail.batchCost +
    detail.operatingExpenses;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="modal daily-profit-modal">
        <div className="modal-head">
          <div>
            <div className="daily-profit-title-row">
              <h3>{detail.date} 纯利润组成</h3>
              <span
                className={`daily-profit-status ${
                  detail.pureProfit >= 0 ? "positive" : "negative"
                }`}
              >
                {detail.pureProfit >= 0 ? "盈利" : "亏损"}
              </span>
            </div>
            <p className="sub">
              当天企业结算减去全部直接成本、投放成本和运营费用
            </p>
          </div>
          <button className="close" onClick={close}>
            ×
          </button>
        </div>

        <div className="daily-profit-hero">
          <div>
            <span>当天企业结算</span>
            <strong>{money(detail.grossRevenue)}</strong>
            <small>{detail.orders.length}条订单</small>
          </div>
          <div>
            <span>当天全部扣除</span>
            <strong>{money(totalDeductions)}</strong>
            <small>工资、送人费、投放与运营费用</small>
          </div>
          <div className={detail.pureProfit >= 0 ? "positive" : "negative"}>
            <span>当天纯利润</span>
            <strong>{money(detail.pureProfit)}</strong>
            <small>净利率 {percent(detail.netMargin)}</small>
          </div>
        </div>

        <div className="profit-equation daily-profit-equation">
          <div>
            <span>企业结算</span>
            <strong>{money(detail.grossRevenue)}</strong>
          </div>
          <b>−</b>
          <div>
            <span>兼职工资</span>
            <strong>{money(detail.salaryCost)}</strong>
          </div>
          <b>−</b>
          <div>
            <span>徒弟送人费</span>
            <strong>{money(detail.referralFees)}</strong>
          </div>
          <b>−</b>
          <div>
            <span>其他直接成本</span>
            <strong>{money(detail.otherDirectCost)}</strong>
          </div>
          <b>−</b>
          <div>
            <span>投放成本</span>
            <strong>{money(detail.batchCost)}</strong>
          </div>
          <b>−</b>
          <div>
            <span>运营费用</span>
            <strong>{money(detail.operatingExpenses)}</strong>
          </div>
          <b>=</b>
          <div className="profit-result">
            <span>当天纯利润</span>
            <strong>{money(detail.pureProfit)}</strong>
          </div>
        </div>

        <div className="daily-profit-grid section-gap">
          <section className="inner-panel">
            <div className="inner-panel-head">
              <div>
                <h4>订单收入与利润明细</h4>
                <p>每一单都可以看到结算、工资、送人费和订单利润</p>
              </div>
              <strong>{money(detail.grossRevenue)}</strong>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <thead>
                  <tr>
                    <th>项目</th>
                    <th>人员</th>
                    <th>企业结算</th>
                    <th>兼职工资</th>
                    <th>送人费</th>
                    <th>其他成本</th>
                    <th>订单利润</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.orders.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty">当天没有订单收入</div>
                      </td>
                    </tr>
                  ) : (
                    detail.orders.map((item) => {
                      const profit =
                        item.income -
                        item.salary -
                        item.referralFee -
                        item.otherCost;
                      return (
                        <tr key={item.id}>
                          <td>{item.project || "未分类"}</td>
                          <td>{item.name || "—"}</td>
                          <td>{money(item.income)}</td>
                          <td>{money(item.salary)}</td>
                          <td>
                            {item.referralMember
                              ? `${item.referralMember} · ${money(
                                  item.referralFee,
                                )}`
                              : money(item.referralFee)}
                          </td>
                          <td>{money(item.otherCost)}</td>
                          <td
                            className={
                              profit >= 0 ? "money-pos" : "money-neg"
                            }
                          >
                            {money(profit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="inner-panel">
            <div className="inner-panel-head">
              <div>
                <h4>按项目汇总</h4>
                <p>快速判断当天利润主要来自哪个项目</p>
              </div>
            </div>
            <div className="metric-list">
              {detail.projects.length === 0 ? (
                <div className="empty">当天暂无项目收入</div>
              ) : (
                detail.projects.map((item) => (
                  <div className="daily-project-row" key={item.project}>
                    <div>
                      <strong>{item.project}</strong>
                      <span>
                        结算 {money(item.revenue)} · 直接成本{" "}
                        {money(
                          item.salary +
                            item.referralFee +
                            item.otherCost,
                        )}
                      </span>
                    </div>
                    <b
                      className={
                        item.orderProfit >= 0
                          ? "money-pos"
                          : "money-neg"
                      }
                    >
                      {money(item.orderProfit)}
                    </b>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="daily-profit-grid section-gap">
          <section className="inner-panel">
            <div className="inner-panel-head">
              <div>
                <h4>投放成本</h4>
                <p>当天所有投放批次的实际支出</p>
              </div>
              <strong className="money-neg">
                {money(detail.batchCost)}
              </strong>
            </div>
            <div className="deduction-list">
              {detail.batches.length === 0 ? (
                <div className="empty">当天没有投放成本</div>
              ) : (
                detail.batches.map((item) => (
                  <div className="deduction-row" key={item.id}>
                    <div>
                      <strong>{item.batchNo || "未命名批次"}</strong>
                      <span>
                        {item.channel} · {item.receiverWechat || "未记录微信"}
                      </span>
                    </div>
                    <b>{money(item.cost)}</b>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="inner-panel">
            <div className="inner-panel-head">
              <div>
                <h4>运营费用</h4>
                <p>员工工资、客服工资和其他非订单费用</p>
              </div>
              <strong className="money-neg">
                {money(detail.operatingExpenses)}
              </strong>
            </div>
            <div className="deduction-list">
              {detail.expenses.length === 0 ? (
                <div className="empty">当天没有运营费用</div>
              ) : (
                detail.expenses.map((item) => (
                  <div className="deduction-row" key={item.id}>
                    <div>
                      <strong>{item.category}</strong>
                      <span>
                        {item.payee || "未记录收款人"} ·{" "}
                        {item.note || "无备注"}
                      </span>
                    </div>
                    <b>{money(item.amount)}</b>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="modal-actions actions">
          <button className="btn primary" onClick={close}>
            关闭明细
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorModal({
  modal,
  db,
  setDb,
  close,
}: {
  modal: NonNullable<ModalState>;
  db: DB;
  setDb: Dispatch<SetStateAction<DB>>;
  close: () => void;
}) {
  const existing = findExisting(modal.type, modal.id || "", db);
  const [form, setForm] = useState<Record<string, string | number>>(() => ({
    ...defaultForm(modal.type, db),
    ...(existing as unknown as Record<string, string | number> | undefined),
    ...(modal.preset || {}),
  }));

  const set = (key: string, value: string | number) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  function selectContact(contactId: string) {
    const contact = db.contacts.find((item) => item.id === contactId);
    setForm((previous) => ({
      ...previous,
      contactId,
      name: contact?.name || "",
      phone: contact?.phone || "",
      source: previous.source || contact?.source || "",
    }));
  }

  function selectProject(projectName: string) {
    const project = db.projects.find((item) => item.name === projectName);
    setForm((previous) => ({
      ...previous,
      project: projectName,
      income: project?.settlement ?? Number(previous.income || 0),
      salary: project?.wage ?? Number(previous.salary || 0),
    }));
  }

  function selectReferrer(memberName: string) {
    const member = db.members.find((item) => item.name === memberName);
    setForm((previous) => ({
      ...previous,
      referralMember: memberName,
      referralFee: memberName
        ? member?.defaultReferralFee ?? Number(previous.referralFee || 0)
        : 0,
    }));
  }

  function selectBatch(batchId: string) {
    const batch = db.batches.find((item) => item.id === batchId);
    setForm((previous) => ({
      ...previous,
      batchId,
      batchNo: batch?.batchNo || "",
      leadDate: batch?.date || String(previous.leadDate || today()),
      member: batch?.owner || String(previous.member || "良辰"),
      receiverWechat: batch?.receiverWechat || "",
      arrivals: batch?.wechat || 0,
    }));
  }

  function save() {
    const now = isoNow();
    const item = {
      ...form,
      id: existing?.id || uid(),
      ...(modal.type === "order"
        ? {
            createdAt:
              (existing as Order | undefined)?.createdAt ||
              String(form.createdAt || now),
            updatedAt: now,
          }
        : {}),
    };

    if (modal.type === "order") {
      setDb((previous) => {
        const order = item as unknown as Order;
        const orders = existing
          ? previous.orders.map((entry) =>
              entry.id === existing.id ? order : entry,
            )
          : [order, ...previous.orders];
        let contacts = previous.contacts;
        if (!order.contactId && order.name.trim()) {
          const matched = contacts.find(
            (contact) =>
              contact.name === order.name ||
              (order.phone && contact.phone === order.phone),
          );
          if (matched) {
            order.contactId = matched.id;
          } else {
            const newContact: Contact = {
              id: uid(),
              name: order.name,
              phone: order.phone,
              gender: "未知",
              contactType: "兼职",
              city: "长沙",
              source: order.source,
              projects: order.project,
              rating: "B",
              tags: "自动建档",
              note: "由订单自动创建",
            };
            order.contactId = newContact.id;
            contacts = [newContact, ...contacts];
          }
        }
        return { ...previous, orders: [...orders], contacts: [...contacts] };
      });
      close();
      return;
    }

    const key = modalKey(modal.type);
    setDb((previous) => {
      const list = previous[key] as unknown as Array<{ id: string }>;
      const next = existing
        ? list.map((entry) => (entry.id === existing.id ? item : entry))
        : [item, ...list];
      return { ...previous, [key]: next } as DB;
    });
    close();
  }

  const titleMap: Record<string, string> = {
    batch: "投放批次",
    lead: "来客批次",
    result: "转化/做单回填",
    order: "订单",
    expense: "费用",
    contact: "联系人",
    member: "成员",
    project: "项目",
    review: "每日复盘",
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3>{existing ? "编辑" : "新增"}{titleMap[modal.type]}</h3>
            {existing && <p className="sub edit-notice">当前为编辑模式，保存后会覆盖原记录。</p>}
          </div>
          <button className="close" onClick={close}>×</button>
        </div>

        {modal.type === "order" && (
          <>
            <div className="form-section">
              <h4>1. 选择兼职或老客户</h4>
              <div className="form-grid">
                <Field label="从CRM选择" className="span-2">
                  <select
                    value={String(form.contactId || "")}
                    onChange={(event) => selectContact(event.target.value)}
                  >
                    <option value="">不选择，手动填写</option>
                    {db.contacts.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name} · {item.contactType} · {item.phone || "无电话"}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="姓名">
                  <input value={String(form.name)} onChange={(event) => set("name", event.target.value)} />
                </Field>
                <Field label="电话/微信">
                  <input value={String(form.phone)} onChange={(event) => set("phone", event.target.value)} />
                </Field>
                <Field label="来源渠道">
                  <input value={String(form.source)} onChange={(event) => set("source", event.target.value)} />
                </Field>
              </div>
            </div>

            <div className="form-section">
              <h4>2. 选择项目与做单日期</h4>
              <div className="form-grid">
                <Field label="做单日期">
                  <input type="date" value={String(form.date)} onChange={(event) => set("date", event.target.value)} />
                </Field>
                <Field label="项目" className="span-2">
                  <select value={String(form.project)} onChange={(event) => selectProject(event.target.value)}>
                    <option value="">请选择项目</option>
                    {db.projects.filter((item) => item.status === "进行中").map((item) => (
                      <option value={item.name} key={item.id}>
                        {item.name} · 结算{money(item.settlement)} · 工资{money(item.wage)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="订单负责人">
                  <select value={String(form.owner)} onChange={(event) => set("owner", event.target.value)}>
                    {db.members.map((item) => <option key={item.id}>{item.name}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div className="form-section">
              <h4>3. 成本与纯利润</h4>
              <div className="form-grid">
                <Field label="企业结算">
                  <input type="number" value={Number(form.income)} onChange={(event) => set("income", +event.target.value)} />
                </Field>
                <Field label="兼职工资">
                  <input type="number" value={Number(form.salary)} onChange={(event) => set("salary", +event.target.value)} />
                </Field>
                <Field label="送人徒弟/代理">
                  <select value={String(form.referralMember)} onChange={(event) => selectReferrer(event.target.value)}>
                    <option value="">自己直招/无送人费</option>
                    {db.members.filter((item) => item.name !== "良辰").map((item) => (
                      <option value={item.name} key={item.id}>{item.name} · 默认{money(item.defaultReferralFee)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="送人费用">
                  <input type="number" value={Number(form.referralFee)} onChange={(event) => set("referralFee", +event.target.value)} />
                </Field>
                <Field label="其他直接成本">
                  <input type="number" value={Number(form.otherCost)} onChange={(event) => set("otherCost", +event.target.value)} />
                </Field>
                <Field label="订单状态">
                  <select value={String(form.status)} onChange={(event) => set("status", event.target.value)}>
                    <option>已完成</option>
                    <option>待结算</option>
                    <option>已取消</option>
                  </select>
                </Field>
                <Field label="自动订单纯利润" className="span-2">
                  <div className="calculated-value profit-value">
                    {money(Number(form.income) - Number(form.salary) - Number(form.referralFee) - Number(form.otherCost))}
                  </div>
                </Field>
                <Field label="备注" className="span-4">
                  <textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} />
                </Field>
              </div>
            </div>
          </>
        )}

        {modal.type === "batch" && (
          <div className="form-grid">
            <Field label="日期"><input type="date" value={String(form.date)} onChange={(event) => set("date", event.target.value)} /></Field>
            <Field label="批次编号"><input value={String(form.batchNo)} onChange={(event) => set("batchNo", event.target.value)} /></Field>
            <Field label="流量方式"><select value={String(form.channel)} onChange={(event) => set("channel", event.target.value)}><option>小红书双号代发</option><option>小红书截流</option><option>抖音作品</option><option>抖音截流</option><option>自然复购</option><option>其他</option></select></Field>
            <Field label="承接微信"><input value={String(form.receiverWechat)} onChange={(event) => set("receiverWechat", event.target.value)} /></Field>
            <Field label="账号1"><input value={String(form.account1)} onChange={(event) => set("account1", event.target.value)} /></Field>
            <Field label="账号2"><input value={String(form.account2)} onChange={(event) => set("account2", event.target.value)} /></Field>
            <Field label="账号数"><input type="number" value={Number(form.accountCount)} onChange={(event) => set("accountCount", +event.target.value)} /></Field>
            <Field label="帖子数"><input type="number" value={Number(form.posts)} onChange={(event) => set("posts", +event.target.value)} /></Field>
            <Field label="投放成本"><input type="number" value={Number(form.cost)} onChange={(event) => set("cost", +event.target.value)} /></Field>
            <Field label="批次来客"><input type="number" value={Number(form.wechat)} onChange={(event) => set("wechat", +event.target.value)} /></Field>
            <Field label="负责人"><select value={String(form.owner)} onChange={(event) => set("owner", event.target.value)}>{db.members.map((item) => <option key={item.id}>{item.name}</option>)}</select></Field>
            <Field label="单客成本"><div className="calculated-value">{money(Number(form.wechat) ? Number(form.cost) / Number(form.wechat) : 0)}</div></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} /></Field>
          </div>
        )}

        {modal.type === "lead" && (
          <div className="form-grid">
            <Field label="关联投放批次" className="span-2">
              <select value={String(form.batchId)} onChange={(event) => selectBatch(event.target.value)}>
                <option value="">不关联，手动登记</option>
                {[...db.batches].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
                  <option value={item.id} key={item.id}>{item.date} · {item.batchNo} · {item.receiverWechat} · {item.wechat}人</option>
                ))}
              </select>
            </Field>
            <Field label="来客日期"><input type="date" value={String(form.leadDate)} onChange={(event) => set("leadDate", event.target.value)} /></Field>
            <Field label="负责人"><select value={String(form.member)} onChange={(event) => set("member", event.target.value)}>{db.members.map((item) => <option key={item.id}>{item.name}</option>)}</select></Field>
            <Field label="批次编号"><input value={String(form.batchNo)} onChange={(event) => set("batchNo", event.target.value)} /></Field>
            <Field label="承接微信"><input value={String(form.receiverWechat)} onChange={(event) => set("receiverWechat", event.target.value)} /></Field>
            <Field label="来客人数"><input type="number" value={Number(form.arrivals)} onChange={(event) => set("arrivals", +event.target.value)} /></Field>
            <Field label="有效咨询"><input type="number" value={Number(form.consultations)} onChange={(event) => set("consultations", +event.target.value)} /></Field>
            <Field label="咨询率"><div className="calculated-value">{percent(Number(form.arrivals) ? Number(form.consultations) / Number(form.arrivals) * 100 : 0)}</div></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} /></Field>
          </div>
        )}

        {modal.type === "result" && (
          <div className="form-grid">
            <Field label="选择原来客批次" className="span-2">
              <select value={String(form.leadCohortId)} onChange={(event) => set("leadCohortId", event.target.value)}>
                <option value="">请选择</option>
                {[...leadStatsForForm(db)].sort((a, b) => b.leadDate.localeCompare(a.leadDate)).map((item) => (
                  <option value={item.id} key={item.id}>{item.leadDate} · {item.member} · {item.receiverWechat} · 来客{item.arrivals} · 已报{item.registered}</option>
                ))}
              </select>
            </Field>
            <Field label="报名/转化日期"><input type="date" value={String(form.conversionDate)} onChange={(event) => set("conversionDate", event.target.value)} /></Field>
            <Field label="预计/实际做单日期"><input type="date" value={String(form.workDate)} onChange={(event) => set("workDate", event.target.value)} /></Field>
            <Field label="报名人数"><input type="number" value={Number(form.registered)} onChange={(event) => set("registered", +event.target.value)} /></Field>
            <Field label="实际完成人数"><input type="number" value={Number(form.completed)} onChange={(event) => set("completed", +event.target.value)} /></Field>
            <Field label="归因收入"><input type="number" value={Number(form.revenue)} onChange={(event) => set("revenue", +event.target.value)} /></Field>
            <Field label="工资/提成/其他成本"><input type="number" value={Number(form.cost)} onChange={(event) => set("cost", +event.target.value)} /></Field>
            <Field label="贡献利润"><div className="calculated-value profit-value">{money(Number(form.revenue) - Number(form.cost))}</div></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} placeholder="例如：7月23日来客，当天报名，7月24日做单" /></Field>
          </div>
        )}

        {modal.type === "expense" && (
          <div className="form-grid">
            <Field label="日期"><input type="date" value={String(form.date)} onChange={(event) => set("date", event.target.value)} /></Field>
            <Field label="费用类型"><input value={String(form.category)} onChange={(event) => set("category", event.target.value)} /></Field>
            <Field label="金额"><input type="number" value={Number(form.amount)} onChange={(event) => set("amount", +event.target.value)} /></Field>
            <Field label="收款人"><input value={String(form.payee)} onChange={(event) => set("payee", event.target.value)} /></Field>
            <Field label="负责人"><select value={String(form.owner)} onChange={(event) => set("owner", event.target.value)}>{db.members.map((item) => <option key={item.id}>{item.name}</option>)}</select></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} /></Field>
          </div>
        )}

        {modal.type === "contact" && (
          <div className="form-grid">
            <Field label="姓名"><input value={String(form.name)} onChange={(event) => set("name", event.target.value)} /></Field>
            <Field label="电话/微信"><input value={String(form.phone)} onChange={(event) => set("phone", event.target.value)} /></Field>
            <Field label="联系人类型"><select value={String(form.contactType)} onChange={(event) => set("contactType", event.target.value)}><option>兼职</option><option>客户</option></select></Field>
            <Field label="性别"><select value={String(form.gender)} onChange={(event) => set("gender", event.target.value)}><option>男</option><option>女</option><option>未知</option></select></Field>
            <Field label="城市/学校"><input value={String(form.city)} onChange={(event) => set("city", event.target.value)} /></Field>
            <Field label="来源"><input value={String(form.source)} onChange={(event) => set("source", event.target.value)} /></Field>
            <Field label="评级"><select value={String(form.rating)} onChange={(event) => set("rating", event.target.value)}><option>A</option><option>B</option><option>C</option></select></Field>
            <Field label="做过项目" className="span-2"><input value={String(form.projects)} onChange={(event) => set("projects", event.target.value)} /></Field>
            <Field label="标签" className="span-2"><input value={String(form.tags)} onChange={(event) => set("tags", event.target.value)} /></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} /></Field>
          </div>
        )}

        {modal.type === "member" && (
          <div className="form-grid">
            <Field label="成员姓名"><input value={String(form.name)} onChange={(event) => set("name", event.target.value)} /></Field>
            <Field label="角色"><input value={String(form.role)} onChange={(event) => set("role", event.target.value)} /></Field>
            <Field label="默认送人费"><input type="number" value={Number(form.defaultReferralFee)} onChange={(event) => set("defaultReferralFee", +event.target.value)} /></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} /></Field>
          </div>
        )}

        {modal.type === "project" && (
          <div className="form-grid">
            <Field label="项目名称"><input value={String(form.name)} onChange={(event) => set("name", event.target.value)} /></Field>
            <Field label="项目类型"><input value={String(form.category)} onChange={(event) => set("category", event.target.value)} /></Field>
            <Field label="参考结算"><input type="number" value={Number(form.settlement)} onChange={(event) => set("settlement", +event.target.value)} /></Field>
            <Field label="参考工资"><input type="number" value={Number(form.wage)} onChange={(event) => set("wage", +event.target.value)} /></Field>
            <Field label="状态"><select value={String(form.status)} onChange={(event) => set("status", event.target.value)}><option>进行中</option><option>暂停</option><option>结束</option></select></Field>
            <Field label="备注" className="span-4"><textarea value={String(form.note)} onChange={(event) => set("note", event.target.value)} /></Field>
          </div>
        )}

        {modal.type === "review" && (
          <div className="form-grid">
            <Field label="日期"><input type="date" value={String(form.date)} onChange={(event) => set("date", event.target.value)} /></Field>
            <Field label="今日收入"><input type="number" value={Number(form.income)} onChange={(event) => set("income", +event.target.value)} /></Field>
            <Field label="今日纯利润"><input type="number" value={Number(form.profit)} onChange={(event) => set("profit", +event.target.value)} /></Field>
            <Field label="投放成本"><input type="number" value={Number(form.batchCost)} onChange={(event) => set("batchCost", +event.target.value)} /></Field>
            <Field label="当天来客"><input type="number" value={Number(form.arrivals)} onChange={(event) => set("arrivals", +event.target.value)} /></Field>
            <Field label="当天转化"><input type="number" value={Number(form.conversions)} onChange={(event) => set("conversions", +event.target.value)} /></Field>
            <Field label="今日最佳渠道/项目" className="span-4"><textarea value={String(form.best)} onChange={(event) => set("best", event.target.value)} /></Field>
            <Field label="今日问题" className="span-4"><textarea value={String(form.problem)} onChange={(event) => set("problem", event.target.value)} /></Field>
            <Field label="明日调整" className="span-4"><textarea value={String(form.plan)} onChange={(event) => set("plan", event.target.value)} /></Field>
          </div>
        )}

        <div className="actions modal-actions">
          <button className="btn" onClick={close}>取消</button>
          <button className="btn primary" onClick={save}>
            {existing ? "保存修改" : "保存记录"}
          </button>
        </div>
      </div>
    </div>
  );
}

function leadStatsForForm(db: DB) {
  return db.leads.map((lead) => ({
    ...lead,
    registered: db.conversionResults
      .filter((item) => item.leadCohortId === lead.id)
      .reduce((sum, item) => sum + item.registered, 0),
  }));
}

function modalKey(type: string): keyof DB {
  const map: Record<string, keyof DB> = {
    batch: "batches",
    lead: "leads",
    result: "conversionResults",
    order: "orders",
    expense: "expenses",
    contact: "contacts",
    member: "members",
    project: "projects",
    review: "reviews",
  };
  return map[type];
}

function findExisting(type: string, id: string, db: DB) {
  if (!id) return undefined;
  const key = modalKey(type);
  return (db[key] as unknown as Array<{ id: string }>).find(
    (item) => item.id === id,
  );
}

function defaultForm(
  type: string,
  db: DB,
): Record<string, string | number> {
  if (type === "order") {
    return {
      date: today(),
      project: "",
      contactId: "",
      name: "",
      phone: "",
      source: "",
      income: 0,
      salary: 0,
      referralMember: "",
      referralFee: 0,
      otherCost: 0,
      owner: db.members[0]?.name || "良辰",
      status: "已完成",
      note: "",
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
  }
  if (type === "batch") {
    return {
      date: today(),
      batchNo: `${today().slice(5).replace("-", "")}-A`,
      channel: "小红书双号代发",
      receiverWechat: "",
      account1: "",
      account2: "",
      accountCount: 2,
      posts: 2,
      cost: 0,
      wechat: 0,
      owner: db.members[0]?.name || "良辰",
      note: "",
    };
  }
  if (type === "lead") {
    return {
      leadDate: today(),
      batchId: "",
      batchNo: "",
      member: db.members[0]?.name || "良辰",
      receiverWechat: "",
      arrivals: 0,
      consultations: 0,
      note: "",
    };
  }
  if (type === "result") {
    return {
      leadCohortId: "",
      conversionDate: today(),
      workDate: addDays(today(), 1),
      registered: 0,
      completed: 0,
      revenue: 0,
      cost: 0,
      note: "当天报名，次日做单",
    };
  }
  if (type === "expense") {
    return {
      date: today(),
      category: "员工工资",
      amount: 0,
      payee: "",
      owner: db.members[0]?.name || "良辰",
      note: "",
    };
  }
  if (type === "contact") {
    return {
      name: "",
      phone: "",
      gender: "未知",
      contactType: "兼职",
      city: "长沙",
      source: "",
      projects: "",
      rating: "B",
      tags: "",
      note: "",
    };
  }
  if (type === "member") {
    return {
      name: "",
      role: "转化成员",
      defaultReferralFee: 20,
      note: "",
    };
  }
  if (type === "project") {
    return {
      name: "",
      category: "",
      settlement: 0,
      wage: 0,
      status: "进行中",
      note: "",
    };
  }

  const date = today();
  const orders = db.orders.filter(
    (item) => item.date === date && item.status !== "已取消",
  );
  const batches = db.batches.filter((item) => item.date === date);
  const expenses = db.expenses.filter((item) => item.date === date);
  const leads = db.leads.filter((item) => item.leadDate === date);
  const conversions = db.conversionResults.filter(
    (item) => item.conversionDate === date,
  );
  return {
    date,
    income: orders.reduce((sum, item) => sum + item.income, 0),
    profit:
      orders.reduce(
        (sum, item) =>
          sum +
          item.income -
          item.salary -
          item.referralFee -
          item.otherCost,
        0,
      ) -
      batches.reduce((sum, item) => sum + item.cost, 0) -
      expenses.reduce((sum, item) => sum + item.amount, 0),
    batchCost: batches.reduce((sum, item) => sum + item.cost, 0),
    arrivals: leads.reduce((sum, item) => sum + item.arrivals, 0),
    conversions: conversions.reduce(
      (sum, item) => sum + item.registered,
      0,
    ),
    best: "",
    problem: "",
    plan: "",
  };
}
