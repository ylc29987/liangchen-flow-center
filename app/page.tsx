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

type Order = {
  id: string;
  date: string;
  project: string;
  name: string;
  phone: string;
  source: string;
  income: number;
  salary: number;
  otherCost: number;
  owner: string;
  status: "已完成" | "待结算" | "已取消";
  note: string;
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
  note: string;
};

type Project = {
  id: string;
  name: string;
  category: string;
  settlement: number;
  wage: number;
  status: "进行中" | "暂停" | "结束";
  note: string;
};

type Review = {
  id: string;
  date: string;
  income: number;
  profit: number;
  batchCost: number;
  wechat: number;
  deals: number;
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
  consultations: number;
  deals: number;
  attributedProfit: number;
  owner: string;
  note: string;
};

type Conversion = {
  id: string;
  date: string;
  member: string;
  receiverWechat: string;
  assignedWechat: number;
  consultations: number;
  deals: number;
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
  conversions: Conversion[];
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

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) =>
  `¥${Number(value || 0).toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  })}`;
const percent = (value: number) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;

const seed: DB = {
  orders: [
    {
      id: "o1",
      date: "2026-07-20",
      project: "星沙直播",
      name: "郑鑫、张东妹",
      phone: "",
      source: "自有名单",
      income: 700,
      salary: 350,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "两人合计，700-350=350",
    },
    {
      id: "o2",
      date: "2026-07-20",
      project: "好评",
      name: "刘鑫、尹润发",
      phone: "",
      source: "前天好评",
      income: 280,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "流量成本和哲立工资分别记录",
    },
    {
      id: "o3",
      date: "2026-07-21",
      project: "好评",
      name: "龙韬、张紫怡、李楠锋、陈思晴、李雨杰等",
      phone: "已脱敏",
      source: "昨日名单",
      income: 1080,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "6个人，一个是代理的",
    },
    {
      id: "o4",
      date: "2026-07-21",
      project: "星沙直播",
      name: "尹颢竣",
      phone: "",
      source: "自有流量",
      income: 350,
      salary: 150,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "350-150=200",
    },
    {
      id: "o5",
      date: "2026-07-21",
      project: "土桥APP",
      name: "王宝莹、李俊奇",
      phone: "",
      source: "自有流量",
      income: 234,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "",
    },
    {
      id: "o6",
      date: "2026-07-21",
      project: "星沙APP",
      name: "刘鑫",
      phone: "",
      source: "自有流量",
      income: 169,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "130×1.3=169",
    },
    {
      id: "o7",
      date: "2026-07-21",
      project: "小红书账号",
      name: "账号交易",
      phone: "",
      source: "小红书",
      income: 40,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "出了一个账号40",
    },
    {
      id: "o8",
      date: "2026-07-21",
      project: "证券",
      name: "杨洲权等多人",
      phone: "",
      source: "自有/合作代理",
      income: 480,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "按原始净收入公式记录",
    },
    {
      id: "o9",
      date: "2026-07-22",
      project: "岳麓APP",
      name: "陈思晴、陈慧妮",
      phone: "已脱敏",
      source: "自有流量",
      income: 273,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "210×1.3=273",
    },
    {
      id: "o10",
      date: "2026-07-22",
      project: "土桥",
      name: "莫琨",
      phone: "",
      source: "自有流量",
      income: 195,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "150×1.3=195",
    },
    {
      id: "o11",
      date: "2026-07-22",
      project: "证券",
      name: "韦德华、唐慧",
      phone: "",
      source: "自有流量",
      income: 170,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "130+40=170",
    },
    {
      id: "o12",
      date: "2026-07-23",
      project: "线上网店",
      name: "陈思晴",
      phone: "已脱敏",
      source: "复购用户",
      income: 260,
      salary: 100,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "260-100=160",
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
      city: "长沙",
      source: "自有名单",
      projects: "好评、星沙APP",
      rating: "A",
      tags: "多项目",
      note: "",
    },
  ],
  members: [
    { id: "m1", name: "良辰", role: "管理员", note: "主账号承接" },
    { id: "m2", name: "哲立", role: "核心徒弟", note: "主要转化成员" },
    { id: "m3", name: "徒弟B", role: "转化成员", note: "持续统计" },
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
      wechat: 35,
      deals: 4,
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
      wechat: 46,
      deals: 13,
      best: "好评、证券、APP多项目并行",
      problem: "名单来源和项目成本分摊不够细",
      plan: "开始记录批次、承接微信和负责人",
    },
    {
      id: "r3",
      date: "2026-07-22",
      income: 638,
      profit: 388,
      batchCost: 90,
      wechat: 28,
      deals: 5,
      best: "岳麓APP与土桥保持正利润",
      problem: "证券利润偏低",
      plan: "复核成本并设置最低利润线",
    },
    {
      id: "r4",
      date: "2026-07-23",
      income: 260,
      profit: 160,
      batchCost: 0,
      wechat: 1,
      deals: 1,
      best: "老用户复购，无新增获客成本",
      problem: "当日订单量偏少",
      plan: "扩大抖音男性流量测试，召回A级兼职",
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
      posts: 16,
      cost: 126,
      wechat: 35,
      consultations: 24,
      deals: 4,
      attributedProfit: 404,
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
      posts: 18,
      cost: 140,
      wechat: 46,
      consultations: 31,
      deals: 13,
      attributedProfit: 1795,
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
      posts: 12,
      cost: 90,
      wechat: 28,
      consultations: 18,
      deals: 5,
      attributedProfit: 388,
      owner: "良辰",
      note: "由历史流量数据迁移",
    },
    {
      id: "b4",
      date: "2026-07-23",
      batchNo: "0723-R",
      channel: "自然复购",
      receiverWechat: "良辰微信",
      account1: "",
      account2: "",
      accountCount: 0,
      posts: 0,
      cost: 0,
      wechat: 1,
      consultations: 1,
      deals: 1,
      attributedProfit: 160,
      owner: "良辰",
      note: "陈思晴复购",
    },
  ],
  conversions: [],
};

function normalizeDB(raw: unknown): DB {
  if (!raw || typeof raw !== "object") return seed;
  const source = raw as Record<string, unknown>;
  const legacyTraffic = Array.isArray(source.traffic)
    ? (source.traffic as LegacyTraffic[])
    : [];

  const migratedBatches: Batch[] = legacyTraffic.map((item, index) => ({
    id: item.id || `legacy_batch_${index}`,
    date: item.date || today(),
    batchNo: `历史-${item.date || index + 1}`,
    channel: item.channel || "历史流量",
    receiverWechat: "未记录",
    account1: "",
    account2: "",
    accountCount:
      (item.channel || "").includes("小红书") && Number(item.posts || 0) > 0
        ? 2
        : 0,
    posts: Number(item.posts || 0),
    cost: Number(item.cost || 0),
    wechat: Number(item.wechat || 0),
    consultations: Number(item.consultations || 0),
    deals: Number(item.deals || 0),
    attributedProfit: Math.max(
      0,
      Number(item.revenue || 0) - Number(item.cost || 0),
    ),
    owner: "良辰",
    note: item.note || "由旧版流量中心自动迁移",
  }));

  const oldTeam = Array.isArray(source.team)
    ? (source.team as Array<Record<string, unknown>>)
    : [];

  const members: Member[] =
    Array.isArray(source.members) && source.members.length > 0
      ? (source.members as Member[])
      : oldTeam.length > 0
        ? oldTeam.map((item, index) => ({
            id: String(item.id || `legacy_member_${index}`),
            name: String(item.name || `成员${index + 1}`),
            role: String(item.role || "转化成员"),
            note: String(item.note || ""),
          }))
        : seed.members;

  return {
    orders: Array.isArray(source.orders)
      ? (source.orders as Order[]).map((item) => ({
          ...item,
          otherCost: Number(item.otherCost || 0),
        }))
      : seed.orders,
    expenses: Array.isArray(source.expenses)
      ? (source.expenses as Expense[])
      : seed.expenses,
    contacts: Array.isArray(source.contacts)
      ? (source.contacts as Contact[])
      : seed.contacts,
    members,
    projects: Array.isArray(source.projects)
      ? (source.projects as Project[])
      : seed.projects,
    reviews: Array.isArray(source.reviews)
      ? (source.reviews as Review[]).map((item) => ({
          ...item,
          batchCost: Number(
            item.batchCost ??
              (item as unknown as Record<string, unknown>).trafficCost ??
              0,
          ),
        }))
      : seed.reviews,
    batches:
      Array.isArray(source.batches) && source.batches.length > 0
        ? (source.batches as Batch[])
        : migratedBatches.length > 0
          ? migratedBatches
          : seed.batches,
    conversions: Array.isArray(source.conversions)
      ? (source.conversions as Conversion[])
      : [],
  };
}

const navItems = [
  ["dashboard", "经营驾驶舱", "◫"],
  ["batches", "投放批次", "↗"],
  ["conversions", "承接转化", "⇄"],
  ["orders", "订单利润", "¥"],
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
  const [modal, setModal] = useState<string | null>(null);
  const [editId, setEditId] = useState("");
  const [query, setQuery] = useState("");
  const [analysisDate, setAnalysisDate] = useState(today());
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("liangchen_v42");
    if (raw) {
      try {
        const parsed = normalizeDB(JSON.parse(raw));
        setDb(parsed);
        const latestDate = [
          ...parsed.batches.map((item) => item.date),
          ...parsed.conversions.map((item) => item.date),
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
    if (ready) {
      localStorage.setItem("liangchen_v42", JSON.stringify(db));
    }
  }, [db, ready]);

  const orderProfit = (order: Order) =>
    order.income - order.salary - order.otherCost;

  const totals = useMemo(() => {
    const activeOrders = db.orders.filter((item) => item.status !== "已取消");
    const income = activeOrders.reduce((sum, item) => sum + item.income, 0);
    const directCost = activeOrders.reduce(
      (sum, item) => sum + item.salary + item.otherCost,
      0,
    );
    const batchCost = db.batches.reduce((sum, item) => sum + item.cost, 0);
    const expenses = db.expenses.reduce((sum, item) => sum + item.amount, 0);
    const profit = income - directCost - batchCost - expenses;
    const wechat = db.batches.reduce((sum, item) => sum + item.wechat, 0);
    const consultations = db.batches.reduce(
      (sum, item) => sum + item.consultations,
      0,
    );
    const deals = db.batches.reduce((sum, item) => sum + item.deals, 0);

    return {
      income,
      directCost,
      batchCost,
      expenses,
      profit,
      wechat,
      consultations,
      deals,
      cac: wechat ? batchCost / wechat : 0,
      overallRate: wechat ? (deals / wechat) * 100 : 0,
      roi: batchCost ? profit / batchCost : 0,
    };
  }, [db]);

  const batchStats = useMemo(
    () =>
      [...db.batches]
        .map((item) => ({
          ...item,
          cac: item.wechat ? item.cost / item.wechat : 0,
          consultationRate: item.wechat
            ? (item.consultations / item.wechat) * 100
            : 0,
          consultationDealRate: item.consultations
            ? (item.deals / item.consultations) * 100
            : 0,
          overallRate: item.wechat ? (item.deals / item.wechat) * 100 : 0,
          dealCost: item.deals ? item.cost / item.deals : 0,
          perWechatProfit: item.wechat
            ? item.attributedProfit / item.wechat
            : 0,
          roi: item.cost ? item.attributedProfit / item.cost : 0,
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.batches],
  );

  const conversionStats = useMemo(
    () =>
      db.conversions.map((item) => {
        const profit = item.revenue - item.cost;
        return {
          ...item,
          profit,
          consultationRate: item.assignedWechat
            ? (item.consultations / item.assignedWechat) * 100
            : 0,
          consultationDealRate: item.consultations
            ? (item.deals / item.consultations) * 100
            : 0,
          overallRate: item.assignedWechat
            ? (item.deals / item.assignedWechat) * 100
            : 0,
          perWechatProfit: item.assignedWechat
            ? profit / item.assignedWechat
            : 0,
        };
      }),
    [db.conversions],
  );

  const dailyConversionRows = useMemo(
    () => conversionStats.filter((item) => item.date === analysisDate),
    [conversionStats, analysisDate],
  );

  const dailyRanking = useMemo(() => {
    const map = new Map<
      string,
      {
        member: string;
        assignedWechat: number;
        consultations: number;
        deals: number;
        revenue: number;
        cost: number;
      }
    >();

    dailyConversionRows.forEach((item) => {
      const current = map.get(item.member) || {
        member: item.member,
        assignedWechat: 0,
        consultations: 0,
        deals: 0,
        revenue: 0,
        cost: 0,
      };
      current.assignedWechat += item.assignedWechat;
      current.consultations += item.consultations;
      current.deals += item.deals;
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
          consultationRate: item.assignedWechat
            ? (item.consultations / item.assignedWechat) * 100
            : 0,
          consultationDealRate: item.consultations
            ? (item.deals / item.consultations) * 100
            : 0,
          overallRate: item.assignedWechat
            ? (item.deals / item.assignedWechat) * 100
            : 0,
          perWechatProfit: item.assignedWechat
            ? profit / item.assignedWechat
            : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [dailyConversionRows]);

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
          income: orders.reduce((sum, item) => sum + item.income, 0),
          profit: orders.reduce((sum, item) => sum + orderProfit(item), 0),
        };
      }),
    [db.projects, db.orders],
  );

  const dailyProfit = useMemo(() => {
    const map: Record<string, number> = {};

    db.orders.forEach((order) => {
      if (order.status === "已取消") return;
      map[order.date] = (map[order.date] || 0) + orderProfit(order);
    });
    db.batches.forEach((batch) => {
      map[batch.date] = (map[batch.date] || 0) - batch.cost;
    });
    db.expenses.forEach((expense) => {
      map[expense.date] = (map[expense.date] || 0) - expense.amount;
    });

    return Object.entries(map).sort().slice(-7);
  }, [db]);

  const filteredOrders = db.orders.filter((item) =>
    [
      item.name,
      item.phone,
      item.project,
      item.source,
      item.owner,
      item.note,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const filteredContacts = db.contacts.filter((item) =>
    [item.name, item.phone, item.projects, item.tags, item.source]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  function open(type: string, id = "") {
    setModal(type);
    setEditId(id);
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
        const parsed = normalizeDB(JSON.parse(String(reader.result)));
        setDb(parsed);
        alert("导入成功");
      } catch {
        alert("文件格式错误");
      }
    };
    reader.readAsText(file);
  }

  function renderDashboard() {
    const maxProfit = Math.max(...dailyProfit.map(([, value]) => value), 1);
    const bestBatch = [...batchStats].sort((a, b) => b.roi - a.roi)[0];
    const bestProject = [...projectStats].sort(
      (a, b) => b.profit - a.profit,
    )[0];
    const bestMember = [...conversionStats].sort(
      (a, b) => b.perWechatProfit - a.perWechatProfit,
    )[0];

    return (
      <>
        <div className="kpis">
          <Kpi label="累计收入" value={money(totals.income)} hint={`${db.orders.length}条订单`} />
          <Kpi
            label="累计净利润"
            value={money(totals.profit)}
            hint={`净利率 ${percent(
              totals.income ? (totals.profit / totals.income) * 100 : 0,
            )}`}
          />
          <Kpi
            label="投放成本"
            value={money(totals.batchCost)}
            hint={`${db.batches.length}个批次`}
          />
          <Kpi
            label="新增微信"
            value={String(totals.wechat)}
            hint={`单微信 ${money(totals.cac)}`}
          />
          <Kpi
            label="整体转化率"
            value={percent(totals.overallRate)}
            hint={`${totals.deals}个成交`}
          />
          <Kpi
            label="综合ROI"
            value={totals.roi.toFixed(2)}
            hint="净利润 ÷ 投放成本"
          />
        </div>

        <div className="grid-2">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>近7日净利润趋势</h3>
                <p className="sub">自动扣除投放成本和日常费用</p>
              </div>
            </div>
            <div className="mini-chart">
              {dailyProfit.map(([date, value]) => (
                <div className="bar-wrap" key={date}>
                  <div
                    className="bar profit"
                    style={{
                      height: `${Math.max(
                        7,
                        Math.max(0, value) / maxProfit * 150,
                      )}px`,
                    }}
                  >
                    <span>{value}</span>
                  </div>
                  <div className="bar-label">{date.slice(5)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>经营结论</h3>
                <p className="sub">根据当前数据自动判断</p>
              </div>
            </div>
            <div className="metric-list">
              <Metric label="最高ROI批次" value={bestBatch ? `${bestBatch.batchNo} · ${bestBatch.roi.toFixed(2)}` : "暂无"} />
              <Metric label="最高利润项目" value={bestProject ? `${bestProject.name} · ${money(bestProject.profit)}` : "暂无"} />
              <Metric label="单微信价值最高" value={bestMember ? `${bestMember.member} · ${money(bestMember.perWechatProfit)}` : "待录入承接数据"} />
              <Metric label="A级兼职" value={`${db.contacts.filter((item) => item.rating === "A").length}人`} />
            </div>
          </section>
        </div>

        <div className="grid-3">
          <section className="panel">
            <h3>成本结构</h3>
            <div className="metric-list section-gap">
              <Metric label="直接工资/成本" value={money(totals.directCost)} />
              <Metric label="投放成本" value={money(totals.batchCost)} />
              <Metric label="运营费用" value={money(totals.expenses)} />
            </div>
          </section>

          <section className="panel">
            <h3>投放效率</h3>
            <div className="metric-list section-gap">
              <Metric label="有效咨询率" value={percent(totals.wechat ? totals.consultations / totals.wechat * 100 : 0)} />
              <Metric label="整体转化率" value={percent(totals.overallRate)} />
              <Metric label="单成交成本" value={money(totals.deals ? totals.batchCost / totals.deals : 0)} />
            </div>
          </section>

          <section className="panel">
            <h3>系统提醒</h3>
            <div className="notice section-gap">
              {db.conversions.length === 0
                ? "投放数据已具备。下一步录入每名成员每天承接的微信、咨询和成交，系统即可比较转化效率。"
                : dailyRanking.length === 0
                  ? `当前选择的 ${analysisDate} 暂无承接转化记录。`
                  : `当前 ${analysisDate} 单微信利润最高的是 ${[...dailyRanking].sort((a, b) => b.perWechatProfit - a.perWechatProfit)[0]?.member}。`}
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderBatches() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>投放批次中心</h3>
            <p className="sub">
              最小统计单位：一个承接微信 + 一组代发账号 + 当天实际新增与成交
            </p>
          </div>
          <button className="btn primary" onClick={() => open("batch")}>
            ＋新增批次
          </button>
        </div>

        <div className="summary-strip">
          <Summary label="累计批次" value={`${db.batches.length}个`} />
          <Summary label="投放成本" value={money(totals.batchCost)} />
          <Summary label="新增微信" value={`${totals.wechat}人`} />
          <Summary label="单微信成本" value={money(totals.cac)} />
          <Summary label="整体转化率" value={percent(totals.overallRate)} />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>批次</th>
                <th>方式</th>
                <th>承接微信</th>
                <th>账号组合</th>
                <th>帖子</th>
                <th>成本</th>
                <th>新增微信</th>
                <th>咨询率</th>
                <th>成交</th>
                <th>整体转化率</th>
                <th>单微信成本</th>
                <th>单微信利润</th>
                <th>ROI</th>
                <th>负责人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {batchStats.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.batchNo}</td>
                  <td>{item.channel}</td>
                  <td>{item.receiverWechat}</td>
                  <td>
                    {[item.account1, item.account2].filter(Boolean).join(" + ") ||
                      "—"}
                  </td>
                  <td>{item.posts}</td>
                  <td>{money(item.cost)}</td>
                  <td>{item.wechat}</td>
                  <td>{percent(item.consultationRate)}</td>
                  <td>{item.deals}</td>
                  <td>{percent(item.overallRate)}</td>
                  <td>{money(item.cac)}</td>
                  <td>{money(item.perWechatProfit)}</td>
                  <td className={item.roi >= 0 ? "money-pos" : "money-neg"}>
                    {item.roi.toFixed(2)}
                  </td>
                  <td>{item.owner}</td>
                  <td>
                    <button
                      className="btn sm"
                      onClick={() => open("batch", item.id)}
                    >
                      编辑
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
      </section>
    );
  }

  function renderConversions() {
    const totalAssigned = dailyRanking.reduce(
      (sum, item) => sum + item.assignedWechat,
      0,
    );
    const totalConsultations = dailyRanking.reduce(
      (sum, item) => sum + item.consultations,
      0,
    );
    const totalDeals = dailyRanking.reduce((sum, item) => sum + item.deals, 0);
    const totalProfit = dailyRanking.reduce((sum, item) => sum + item.profit, 0);

    return (
      <>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>承接转化中心</h3>
              <p className="sub">
                按日期和负责人比较：咨询率、成交率、单微信利润和当日贡献利润
              </p>
            </div>
            <button className="btn primary" onClick={() => open("conversion")}>
              ＋新增承接记录
            </button>
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
            <Summary label="当日分配微信" value={`${totalAssigned}人`} />
            <Summary
              label="有效咨询率"
              value={percent(
                totalAssigned ? totalConsultations / totalAssigned * 100 : 0,
              )}
            />
            <Summary
              label="整体转化率"
              value={percent(totalAssigned ? totalDeals / totalAssigned * 100 : 0)}
            />
            <Summary label="当日成交" value={`${totalDeals}人`} />
            <Summary label="当日贡献利润" value={money(totalProfit)} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>{analysisDate} 团队效率排行榜</h3>
              <p className="sub">
                不设置模糊总分，直接比较真实经营指标
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>负责人</th>
                  <th>分配微信</th>
                  <th>有效咨询</th>
                  <th>咨询率</th>
                  <th>成交</th>
                  <th>咨询成交率</th>
                  <th>整体转化率</th>
                  <th>归因收入</th>
                  <th>成本</th>
                  <th>贡献利润</th>
                  <th>单微信利润</th>
                </tr>
              </thead>
              <tbody>
                {dailyRanking.length === 0 ? (
                  <tr>
                    <td colSpan={12}>
                      <div className="empty">
                        这一天还没有承接记录。点击“新增承接记录”开始统计。
                      </div>
                    </td>
                  </tr>
                ) : (
                  dailyRanking.map((item, index) => (
                    <tr key={item.member}>
                      <td>
                        <span className={`rank rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <strong>{item.member}</strong>
                      </td>
                      <td>{item.assignedWechat}</td>
                      <td>{item.consultations}</td>
                      <td>{percent(item.consultationRate)}</td>
                      <td>{item.deals}</td>
                      <td>{percent(item.consultationDealRate)}</td>
                      <td>{percent(item.overallRate)}</td>
                      <td>{money(item.revenue)}</td>
                      <td>{money(item.cost)}</td>
                      <td
                        className={
                          item.profit >= 0 ? "money-pos" : "money-neg"
                        }
                      >
                        {money(item.profit)}
                      </td>
                      <td>{money(item.perWechatProfit)}</td>
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
              <h3>承接明细</h3>
              <p className="sub">
                同一负责人同一天可录入多个微信或多个批次
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>负责人</th>
                  <th>承接微信</th>
                  <th>分配微信</th>
                  <th>咨询</th>
                  <th>成交</th>
                  <th>整体转化率</th>
                  <th>收入</th>
                  <th>成本</th>
                  <th>利润</th>
                  <th>单微信利润</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {[...conversionStats]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td>{item.member}</td>
                      <td>{item.receiverWechat}</td>
                      <td>{item.assignedWechat}</td>
                      <td>{item.consultations}</td>
                      <td>{item.deals}</td>
                      <td>{percent(item.overallRate)}</td>
                      <td>{money(item.revenue)}</td>
                      <td>{money(item.cost)}</td>
                      <td
                        className={
                          item.profit >= 0 ? "money-pos" : "money-neg"
                        }
                      >
                        {money(item.profit)}
                      </td>
                      <td>{money(item.perWechatProfit)}</td>
                      <td>{item.note || "—"}</td>
                      <td>
                        <button
                          className="btn sm"
                          onClick={() => open("conversion", item.id)}
                        >
                          编辑
                        </button>{" "}
                        <button
                          className="btn sm danger"
                          onClick={() => remove("conversions", item.id)}
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
              订单利润只扣直接工资和其他直接成本；投放成本在批次中心统一记录
            </p>
          </div>
          <button className="btn primary" onClick={() => open("order")}>
            ＋新增订单
          </button>
        </div>
        <div className="toolbar">
          <input
            className="search"
            placeholder="搜索姓名、电话、项目、来源…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>项目</th>
                <th>人员</th>
                <th>联系方式</th>
                <th>来源</th>
                <th>收入</th>
                <th>直接工资</th>
                <th>其他成本</th>
                <th>订单利润</th>
                <th>负责人</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.project}</td>
                  <td>{item.name}</td>
                  <td>{item.phone || "—"}</td>
                  <td>{item.source || "—"}</td>
                  <td>{money(item.income)}</td>
                  <td>{money(item.salary)}</td>
                  <td>{money(item.otherCost)}</td>
                  <td
                    className={
                      orderProfit(item) >= 0 ? "money-pos" : "money-neg"
                    }
                  >
                    {money(orderProfit(item))}
                  </td>
                  <td>{item.owner}</td>
                  <td>
                    <span
                      className={`tag ${
                        item.status === "待结算" ? "warn" : "a"
                      }`}
                    >
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

  function renderExpenses() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>费用中心</h3>
            <p className="sub">员工工资、客服工资、办公费等非订单直接成本</p>
          </div>
          <button className="btn primary" onClick={() => open("expense")}>
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
            <h3>兼职CRM</h3>
            <p className="sub">联系方式、历史项目、评级和二次转化标签</p>
          </div>
          <button className="btn primary" onClick={() => open("contact")}>
            ＋新增用户
          </button>
        </div>
        <div className="toolbar">
          <input
            className="search"
            placeholder="搜索姓名、电话、标签、项目…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>电话/微信</th>
                <th>性别</th>
                <th>城市</th>
                <th>来源</th>
                <th>做过项目</th>
                <th>评级</th>
                <th>标签</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.phone || "—"}</td>
                  <td>{item.gender}</td>
                  <td>{item.city}</td>
                  <td>{item.source}</td>
                  <td>{item.projects}</td>
                  <td>
                    <span
                      className={`tag ${item.rating === "A" ? "a" : "b"}`}
                    >
                      {item.rating}级
                    </span>
                  </td>
                  <td>
                    {item.tags
                      .split(",")
                      .filter(Boolean)
                      .map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                  </td>
                  <td>{item.note || "—"}</td>
                  <td>
                    <button
                      className="btn sm"
                      onClick={() => open("contact", item.id)}
                    >
                      编辑
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
            <h3>成员管理</h3>
            <p className="sub">维护良辰、徒弟和客服名单，供承接记录选择</p>
          </div>
          <button className="btn primary" onClick={() => open("member")}>
            ＋新增成员
          </button>
        </div>
        <div className="member-grid">
          {db.members.map((item) => {
            const records = conversionStats.filter(
              (record) => record.member === item.name,
            );
            const assigned = records.reduce(
              (sum, record) => sum + record.assignedWechat,
              0,
            );
            const deals = records.reduce((sum, record) => sum + record.deals, 0);
            const profit = records.reduce(
              (sum, record) => sum + record.profit,
              0,
            );
            return (
              <div className="member-card" key={item.id}>
                <div>
                  <div className="member-avatar">{item.name.slice(0, 1)}</div>
                  <h4>{item.name}</h4>
                  <span>{item.role}</span>
                </div>
                <div className="member-metrics">
                  <Metric label="累计承接" value={`${assigned}人`} />
                  <Metric
                    label="整体转化"
                    value={percent(assigned ? deals / assigned * 100 : 0)}
                  />
                  <Metric label="累计贡献" value={money(profit)} />
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
            <p className="sub">标准结算、工资口径和实际利润联动</p>
          </div>
          <button className="btn primary" onClick={() => open("project")}>
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
                <th>实际收入</th>
                <th>订单利润</th>
                <th>利润率</th>
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
                  <td>{money(item.income)}</td>
                  <td
                    className={item.profit >= 0 ? "money-pos" : "money-neg"}
                  >
                    {money(item.profit)}
                  </td>
                  <td>
                    {percent(item.income ? item.profit / item.income * 100 : 0)}
                  </td>
                  <td>
                    <span
                      className={`tag ${
                        item.status === "进行中" ? "a" : "warn"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
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
            <p className="sub">保存数据结果、问题判断和次日动作</p>
          </div>
          <button className="btn primary" onClick={() => open("review")}>
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
                    <span>利润 {money(item.profit)}</span>
                    <span>投放成本 {money(item.batchCost)}</span>
                    <span>新增微信 {item.wechat}</span>
                    <span>成交 {item.deals}</span>
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
                <div>
                  <b>最佳渠道/项目</b>
                  {item.best}
                </div>
                <div>
                  <b>主要问题</b>
                  {item.problem}
                </div>
                <div>
                  <b>明日调整</b>
                  {item.plan}
                </div>
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
            数据仍保存在当前浏览器。更新网页不会删除数据，但请定期导出备份。
          </p>
          <div className="actions section-gap">
            <button className="btn primary" onClick={exportData}>
              导出全部数据
            </button>
            <button
              className="btn"
              onClick={() => importRef.current?.click()}
            >
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
          <p className="sub">
            会覆盖当前浏览器中的数据，操作前请先导出备份。
          </p>
          <button
            className="btn danger section-gap"
            onClick={() => {
              if (confirm("确定覆盖当前数据？")) setDb(seed);
            }}
          >
            恢复历史示例
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
            <small>FLOW OPERATIONS V4.4</small>
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
            当前为浏览器本地存储版
            <br />
            更新网页不会影响已有数据
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
            <button className="btn" onClick={exportData}>
              导出备份
            </button>
            <button className="btn primary" onClick={() => open("batch")}>
              ＋快速记批次
            </button>
          </div>
        </div>

        {tab === "dashboard" && renderDashboard()}
        {tab === "batches" && renderBatches()}
        {tab === "conversions" && renderConversions()}
        {tab === "orders" && renderOrders()}
        {tab === "expenses" && renderExpenses()}
        {tab === "crm" && renderCRM()}
        {tab === "members" && renderMembers()}
        {tab === "projects" && renderProjects()}
        {tab === "reviews" && renderReviews()}
        {tab === "data" && renderData()}
      </main>

      {modal && (
        <EditorModal
          type={modal}
          id={editId}
          db={db}
          setDb={setDb}
          close={() => {
            setModal(null);
            setEditId("");
          }}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="hint">{hint}</div>
    </div>
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

function EditorModal({
  type,
  id,
  db,
  setDb,
  close,
}: {
  type: string;
  id: string;
  db: DB;
  setDb: Dispatch<SetStateAction<DB>>;
  close: () => void;
}) {
  const existing = findExisting(type, id, db);
  const [form, setForm] = useState<Record<string, string | number>>(
    (existing as unknown as Record<string, string | number>) ||
      defaultForm(type, db),
  );

  const set = (key: string, value: string | number) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  function save() {
    const item = { ...form, id: existing?.id || uid() };
    const key = modalKey(type);

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
    conversion: "承接转化记录",
    order: "订单",
    expense: "费用",
    contact: "兼职用户",
    member: "成员",
    project: "项目",
    review: "每日复盘",
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3>
            {existing ? "编辑" : "新增"}
            {titleMap[type]}
          </h3>
          <button className="close" onClick={close}>
            ×
          </button>
        </div>

        {type === "batch" && (
          <div className="form-grid">
            <Field label="日期">
              <input
                type="date"
                value={String(form.date)}
                onChange={(event) => set("date", event.target.value)}
              />
            </Field>
            <Field label="批次编号">
              <input
                value={String(form.batchNo)}
                onChange={(event) => set("batchNo", event.target.value)}
                placeholder="例如 0724-A"
              />
            </Field>
            <Field label="流量方式">
              <select
                value={String(form.channel)}
                onChange={(event) => set("channel", event.target.value)}
              >
                <option>小红书双号代发</option>
                <option>小红书截流</option>
                <option>抖音作品</option>
                <option>抖音截流</option>
                <option>自然复购</option>
                <option>其他</option>
              </select>
            </Field>
            <Field label="承接微信">
              <input
                value={String(form.receiverWechat)}
                onChange={(event) => set("receiverWechat", event.target.value)}
                placeholder="良辰微信1号"
              />
            </Field>
            <Field label="小红书账号1">
              <input
                value={String(form.account1)}
                onChange={(event) => set("account1", event.target.value)}
              />
            </Field>
            <Field label="小红书账号2">
              <input
                value={String(form.account2)}
                onChange={(event) => set("account2", event.target.value)}
              />
            </Field>
            <Field label="发布账号数">
              <input
                type="number"
                value={Number(form.accountCount)}
                onChange={(event) => set("accountCount", +event.target.value)}
              />
            </Field>
            <Field label="总帖子数">
              <input
                type="number"
                value={Number(form.posts)}
                onChange={(event) => set("posts", +event.target.value)}
              />
            </Field>
            <Field label="总投放成本">
              <input
                type="number"
                value={Number(form.cost)}
                onChange={(event) => set("cost", +event.target.value)}
              />
            </Field>
            <Field label="新增微信">
              <input
                type="number"
                value={Number(form.wechat)}
                onChange={(event) => set("wechat", +event.target.value)}
              />
            </Field>
            <Field label="有效咨询">
              <input
                type="number"
                value={Number(form.consultations)}
                onChange={(event) => set("consultations", +event.target.value)}
              />
            </Field>
            <Field label="成交人数">
              <input
                type="number"
                value={Number(form.deals)}
                onChange={(event) => set("deals", +event.target.value)}
              />
            </Field>
            <Field label="归因利润">
              <input
                type="number"
                value={Number(form.attributedProfit)}
                onChange={(event) =>
                  set("attributedProfit", +event.target.value)
                }
              />
            </Field>
            <Field label="负责人">
              <input
                list="member-list"
                value={String(form.owner)}
                onChange={(event) => set("owner", event.target.value)}
              />
            </Field>
            <Field label="自动单微信成本">
              <div className="calculated-value">
                {money(
                  Number(form.wechat)
                    ? Number(form.cost) / Number(form.wechat)
                    : 0,
                )}
              </div>
            </Field>
            <Field label="自动整体转化率">
              <div className="calculated-value">
                {percent(
                  Number(form.wechat)
                    ? Number(form.deals) / Number(form.wechat) * 100
                    : 0,
                )}
              </div>
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "conversion" && (
          <div className="form-grid">
            <Field label="日期">
              <input
                type="date"
                value={String(form.date)}
                onChange={(event) => set("date", event.target.value)}
              />
            </Field>
            <Field label="负责人">
              <input
                list="member-list"
                value={String(form.member)}
                onChange={(event) => set("member", event.target.value)}
              />
            </Field>
            <Field label="承接微信">
              <input
                value={String(form.receiverWechat)}
                onChange={(event) => set("receiverWechat", event.target.value)}
              />
            </Field>
            <Field label="分配/新增微信">
              <input
                type="number"
                value={Number(form.assignedWechat)}
                onChange={(event) => set("assignedWechat", +event.target.value)}
              />
            </Field>
            <Field label="有效咨询">
              <input
                type="number"
                value={Number(form.consultations)}
                onChange={(event) => set("consultations", +event.target.value)}
              />
            </Field>
            <Field label="成交人数">
              <input
                type="number"
                value={Number(form.deals)}
                onChange={(event) => set("deals", +event.target.value)}
              />
            </Field>
            <Field label="归因收入">
              <input
                type="number"
                value={Number(form.revenue)}
                onChange={(event) => set("revenue", +event.target.value)}
              />
            </Field>
            <Field label="工资/提成/其他成本">
              <input
                type="number"
                value={Number(form.cost)}
                onChange={(event) => set("cost", +event.target.value)}
              />
            </Field>
            <Field label="咨询率">
              <div className="calculated-value">
                {percent(
                  Number(form.assignedWechat)
                    ? Number(form.consultations) /
                        Number(form.assignedWechat) *
                        100
                    : 0,
                )}
              </div>
            </Field>
            <Field label="整体转化率">
              <div className="calculated-value">
                {percent(
                  Number(form.assignedWechat)
                    ? Number(form.deals) / Number(form.assignedWechat) * 100
                    : 0,
                )}
              </div>
            </Field>
            <Field label="贡献利润">
              <div className="calculated-value money-pos">
                {money(Number(form.revenue) - Number(form.cost))}
              </div>
            </Field>
            <Field label="单微信利润">
              <div className="calculated-value">
                {money(
                  Number(form.assignedWechat)
                    ? (Number(form.revenue) - Number(form.cost)) /
                        Number(form.assignedWechat)
                    : 0,
                )}
              </div>
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "order" && (
          <div className="form-grid">
            <Field label="日期">
              <input
                type="date"
                value={String(form.date)}
                onChange={(event) => set("date", event.target.value)}
              />
            </Field>
            <Field label="项目">
              <input
                list="project-list"
                value={String(form.project)}
                onChange={(event) => set("project", event.target.value)}
              />
            </Field>
            <Field label="兼职姓名">
              <input
                value={String(form.name)}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field label="电话/微信">
              <input
                value={String(form.phone)}
                onChange={(event) => set("phone", event.target.value)}
              />
            </Field>
            <Field label="来源渠道">
              <input
                value={String(form.source)}
                onChange={(event) => set("source", event.target.value)}
              />
            </Field>
            <Field label="企业结算">
              <input
                type="number"
                value={Number(form.income)}
                onChange={(event) => set("income", +event.target.value)}
              />
            </Field>
            <Field label="兼职工资">
              <input
                type="number"
                value={Number(form.salary)}
                onChange={(event) => set("salary", +event.target.value)}
              />
            </Field>
            <Field label="其他直接成本">
              <input
                type="number"
                value={Number(form.otherCost)}
                onChange={(event) => set("otherCost", +event.target.value)}
              />
            </Field>
            <Field label="负责人">
              <input
                list="member-list"
                value={String(form.owner)}
                onChange={(event) => set("owner", event.target.value)}
              />
            </Field>
            <Field label="状态">
              <select
                value={String(form.status)}
                onChange={(event) => set("status", event.target.value)}
              >
                <option>已完成</option>
                <option>待结算</option>
                <option>已取消</option>
              </select>
            </Field>
            <Field label="自动订单利润">
              <div className="calculated-value money-pos">
                {money(
                  Number(form.income) -
                    Number(form.salary) -
                    Number(form.otherCost),
                )}
              </div>
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "expense" && (
          <div className="form-grid">
            <Field label="日期">
              <input
                type="date"
                value={String(form.date)}
                onChange={(event) => set("date", event.target.value)}
              />
            </Field>
            <Field label="费用类型">
              <input
                value={String(form.category)}
                onChange={(event) => set("category", event.target.value)}
              />
            </Field>
            <Field label="金额">
              <input
                type="number"
                value={Number(form.amount)}
                onChange={(event) => set("amount", +event.target.value)}
              />
            </Field>
            <Field label="收款人">
              <input
                value={String(form.payee)}
                onChange={(event) => set("payee", event.target.value)}
              />
            </Field>
            <Field label="负责人">
              <input
                list="member-list"
                value={String(form.owner)}
                onChange={(event) => set("owner", event.target.value)}
              />
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "contact" && (
          <div className="form-grid">
            <Field label="姓名">
              <input
                value={String(form.name)}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field label="电话/微信">
              <input
                value={String(form.phone)}
                onChange={(event) => set("phone", event.target.value)}
              />
            </Field>
            <Field label="性别">
              <select
                value={String(form.gender)}
                onChange={(event) => set("gender", event.target.value)}
              >
                <option>男</option>
                <option>女</option>
                <option>未知</option>
              </select>
            </Field>
            <Field label="城市/学校">
              <input
                value={String(form.city)}
                onChange={(event) => set("city", event.target.value)}
              />
            </Field>
            <Field label="来源">
              <input
                value={String(form.source)}
                onChange={(event) => set("source", event.target.value)}
              />
            </Field>
            <Field label="评级">
              <select
                value={String(form.rating)}
                onChange={(event) => set("rating", event.target.value)}
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </Field>
            <Field label="做过项目" className="span-2">
              <input
                value={String(form.projects)}
                onChange={(event) => set("projects", event.target.value)}
              />
            </Field>
            <Field label="标签（逗号分隔）" className="span-2">
              <input
                value={String(form.tags)}
                onChange={(event) => set("tags", event.target.value)}
              />
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "member" && (
          <div className="form-grid">
            <Field label="成员姓名">
              <input
                value={String(form.name)}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field label="角色">
              <input
                value={String(form.role)}
                onChange={(event) => set("role", event.target.value)}
              />
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "project" && (
          <div className="form-grid">
            <Field label="项目名称">
              <input
                value={String(form.name)}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field label="项目类型">
              <input
                value={String(form.category)}
                onChange={(event) => set("category", event.target.value)}
              />
            </Field>
            <Field label="参考结算">
              <input
                type="number"
                value={Number(form.settlement)}
                onChange={(event) => set("settlement", +event.target.value)}
              />
            </Field>
            <Field label="参考工资">
              <input
                type="number"
                value={Number(form.wage)}
                onChange={(event) => set("wage", +event.target.value)}
              />
            </Field>
            <Field label="状态">
              <select
                value={String(form.status)}
                onChange={(event) => set("status", event.target.value)}
              >
                <option>进行中</option>
                <option>暂停</option>
                <option>结束</option>
              </select>
            </Field>
            <Field label="备注" className="span-4">
              <textarea
                value={String(form.note)}
                onChange={(event) => set("note", event.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "review" && (
          <div className="form-grid">
            <Field label="日期">
              <input
                type="date"
                value={String(form.date)}
                onChange={(event) => set("date", event.target.value)}
              />
            </Field>
            <Field label="今日收入">
              <input
                type="number"
                value={Number(form.income)}
                onChange={(event) => set("income", +event.target.value)}
              />
            </Field>
            <Field label="今日利润">
              <input
                type="number"
                value={Number(form.profit)}
                onChange={(event) => set("profit", +event.target.value)}
              />
            </Field>
            <Field label="投放成本">
              <input
                type="number"
                value={Number(form.batchCost)}
                onChange={(event) => set("batchCost", +event.target.value)}
              />
            </Field>
            <Field label="新增微信">
              <input
                type="number"
                value={Number(form.wechat)}
                onChange={(event) => set("wechat", +event.target.value)}
              />
            </Field>
            <Field label="成交人数">
              <input
                type="number"
                value={Number(form.deals)}
                onChange={(event) => set("deals", +event.target.value)}
              />
            </Field>
            <Field label="今日最佳渠道/项目" className="span-4">
              <textarea
                value={String(form.best)}
                onChange={(event) => set("best", event.target.value)}
              />
            </Field>
            <Field label="今日问题" className="span-4">
              <textarea
                value={String(form.problem)}
                onChange={(event) => set("problem", event.target.value)}
              />
            </Field>
            <Field label="明日调整" className="span-4">
              <textarea
                value={String(form.plan)}
                onChange={(event) => set("plan", event.target.value)}
              />
            </Field>
          </div>
        )}

        <datalist id="member-list">
          {db.members.map((item) => (
            <option value={item.name} key={item.id} />
          ))}
        </datalist>
        <datalist id="project-list">
          {db.projects.map((item) => (
            <option value={item.name} key={item.id} />
          ))}
        </datalist>

        <div className="actions modal-actions">
          <button className="btn" onClick={close}>
            取消
          </button>
          <button className="btn primary" onClick={save}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function modalKey(type: string): keyof DB {
  const map: Record<string, keyof DB> = {
    batch: "batches",
    conversion: "conversions",
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

function defaultForm(type: string, db: DB): Record<string, string | number> {
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
      consultations: 0,
      deals: 0,
      attributedProfit: 0,
      owner: "良辰",
      note: "",
    };
  }

  if (type === "conversion") {
    return {
      date: today(),
      member: db.members[0]?.name || "良辰",
      receiverWechat: "",
      assignedWechat: 0,
      consultations: 0,
      deals: 0,
      revenue: 0,
      cost: 0,
      note: "",
    };
  }

  if (type === "order") {
    return {
      date: today(),
      project: db.projects[0]?.name || "",
      name: "",
      phone: "",
      source: "",
      income: 0,
      salary: 0,
      otherCost: 0,
      owner: "良辰",
      status: "已完成",
      note: "",
    };
  }

  if (type === "expense") {
    return {
      date: today(),
      category: "员工工资",
      amount: 0,
      payee: "",
      owner: "良辰",
      note: "",
    };
  }

  if (type === "contact") {
    return {
      name: "",
      phone: "",
      gender: "未知",
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

  const day = today();
  const dayOrders = db.orders.filter(
    (item) => item.date === day && item.status !== "已取消",
  );
  const dayBatches = db.batches.filter((item) => item.date === day);
  const dayExpenses = db.expenses.filter((item) => item.date === day);

  return {
    date: day,
    income: dayOrders.reduce((sum, item) => sum + item.income, 0),
    profit:
      dayOrders.reduce(
        (sum, item) => sum + item.income - item.salary - item.otherCost,
        0,
      ) -
      dayBatches.reduce((sum, item) => sum + item.cost, 0) -
      dayExpenses.reduce((sum, item) => sum + item.amount, 0),
    batchCost: dayBatches.reduce((sum, item) => sum + item.cost, 0),
    wechat: dayBatches.reduce((sum, item) => sum + item.wechat, 0),
    deals: dayBatches.reduce((sum, item) => sum + item.deals, 0),
    best: "",
    problem: "",
    plan: "",
  };
}
