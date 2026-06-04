import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// =========================================================================
// Supabase 云客户端初始化与容错
// =========================================================================
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
let isSupabaseMode = false;

// 验证 Supabase 配置是否有效且不是占位符
if (
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your_supabase_url") &&
  !supabaseAnonKey.includes("your_supabase_anon_key")
) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseMode = true;
    console.log("⚡ [Database] Supabase 连接凭证检测通过，云数据库模块激活。");
  } catch (error) {
    console.error("❌ [Database] Supabase 客户端初始化失败:", error);
  }
} else {
  console.log(
    "🔵 [Database] 未配置有效的 Supabase 凭证，系统将启用高可用 Mock 沙箱模式运行。",
  );
}

// =========================================================================
// 本地内存沙箱数据库 (Fallback Sandbox Mock Data)
// =========================================================================
const mockDb = {
  categories: [
    { id: "mobile", name_key: "phone_devices", color: "#3b82f6" },
    { id: "accessories", name_key: "accessories", color: "#10b981" },
    { id: "large", name_key: "large_appliances", color: "#ef4444" },
    { id: "small", name_key: "small_appliances", color: "#a855f7" },
  ],
  items: [
    {
      id: "m-tecno",
      category_id: "mobile",
      name_zh: "TECNO",
      name_en: "TECNO",
      quantity: 6,
      unit_price: 150.0,
      is_internal: false,
    },
    {
      id: "m-infinix",
      category_id: "mobile",
      name_zh: "Infinix",
      name_en: "Infinix",
      quantity: 6,
      unit_price: 177.0,
      is_internal: false,
    },
    {
      id: "m-itel",
      category_id: "mobile",
      name_zh: "ITEL",
      name_en: "ITEL",
      quantity: 5,
      unit_price: 127.8,
      is_internal: false,
    },
    {
      id: "a-own",
      category_id: "accessories",
      name_zh: "自有品牌",
      name_en: "Own Brand",
      quantity: 0,
      unit_price: 15.0,
      is_internal: true,
    },
    {
      id: "a-other",
      category_id: "accessories",
      name_zh: "非自有品牌",
      name_en: "Other Brand",
      quantity: 0,
      unit_price: 8.0,
      is_internal: false,
    },
    {
      id: "l-fridge",
      category_id: "large",
      name_zh: "冰箱",
      name_en: "Refrigerator",
      quantity: 1,
      unit_price: 322.5,
      is_internal: false,
    },
    {
      id: "l-tv",
      category_id: "large",
      name_zh: "电视",
      name_en: "TV",
      quantity: 2,
      unit_price: 310.0,
      is_internal: false,
    },
    {
      id: "l-freezer",
      category_id: "large",
      name_zh: "冰柜",
      name_en: "Freezer",
      quantity: 2,
      unit_price: 180.0,
      is_internal: false,
    },
    {
      id: "l-ac",
      category_id: "large",
      name_zh: "空调",
      name_en: "AC",
      quantity: 0,
      unit_price: 250.0,
      is_internal: false,
    },
    {
      id: "l-washer",
      category_id: "large",
      name_zh: "洗衣机",
      name_en: "Washer",
      quantity: 0,
      unit_price: 240.0,
      is_internal: false,
    },
    {
      id: "l-fan",
      category_id: "large",
      name_zh: "风扇",
      name_en: "Fan",
      quantity: 0,
      unit_price: 50.0,
      is_internal: false,
    },
    {
      id: "l-microwave",
      category_id: "large",
      name_zh: "微波炉",
      name_en: "Microwave Oven",
      quantity: 2,
      unit_price: 113.0,
      is_internal: false,
    },
    {
      id: "l-cooker",
      category_id: "large",
      name_zh: "灶具",
      name_en: "Cooker",
      quantity: 0,
      unit_price: 150.0,
      is_internal: false,
    },
    {
      id: "s-own",
      category_id: "small",
      name_zh: "自有品牌",
      name_en: "Own Brand",
      quantity: 0,
      unit_price: 120.0,
      is_internal: true,
    },
    {
      id: "s-other",
      category_id: "small",
      name_zh: "非自有品牌",
      name_en: "Other Brand",
      quantity: 0,
      unit_price: 80.0,
      is_internal: false,
    },
  ],
  monthlyPerformances: [
    {
      month_key: "m1",
      mobile: 17,
      accessories: 0,
      large_appliances: 0,
      small_appliances: 0,
    },
    {
      month_key: "m2",
      mobile: 12,
      accessories: 0,
      large_appliances: 2,
      small_appliances: 0,
    },
    {
      month_key: "m3",
      mobile: 19,
      accessories: 0,
      large_appliances: 0,
      small_appliances: 0,
    },
    {
      month_key: "m4",
      mobile: 12,
      accessories: 0,
      large_appliances: 2,
      small_appliances: 0,
    },
    {
      month_key: "m5",
      mobile: 13,
      accessories: 0,
      large_appliances: 2,
      small_appliances: 0,
    },
    {
      month_key: "m6",
      mobile: 15,
      accessories: 0,
      large_appliances: 4,
      small_appliances: 0,
    },
  ],
  storeRankings: [
    {
      store_key: "store_1",
      rank_number: 1,
      sales: 23104,
      date_key: "date_range_1",
      percentage: 82,
    },
    {
      store_key: "store_2",
      rank_number: 2,
      sales: 4935,
      date_key: "date_range_2",
      percentage: 18,
    },
    {
      store_key: "store_3",
      rank_number: 3,
      sales: 0,
      date_key: "date_range_1",
      percentage: 0,
    },
  ],
  historicalTrends: [
    {
      ym_key: "d516",
      mobile: 22,
      accessories: 0,
      large_appliances: 0,
      small_appliances: 0,
    },
    {
      ym_key: "d517",
      mobile: 12,
      accessories: 0,
      large_appliances: 2,
      small_appliances: 0,
    },
    {
      ym_key: "d518",
      mobile: 25,
      accessories: 0,
      large_appliances: 0,
      small_appliances: 0,
    },
    {
      ym_key: "d519",
      mobile: 18,
      accessories: 0,
      large_appliances: 2,
      small_appliances: 0,
    },
    {
      ym_key: "d520",
      mobile: 15,
      accessories: 0,
      large_appliances: 2,
      small_appliances: 0,
    },
    {
      ym_key: "d521",
      mobile: 17,
      accessories: 0,
      large_appliances: 7,
      small_appliances: 0,
    },
  ],
  transactions: [] as Array<{
    id: string;
    tx_hash: string;
    status: string;
    confirmations: number;
    payload: any;
    created_at: string;
  }>,
};

// =========================================================================
// API 路由端点设计
// =========================================================================

// 1. 获取系统连通性状态
app.get("/api/status", (req: Request, res: Response) => {
  res.json({
    status: "success",
    mode: isSupabaseMode ? "supabase" : "sandbox",
    databaseConnected: isSupabaseMode,
  });
});

// 2. 获取所有大类及明细商品列表（销售录入页面核心）
app.get("/api/sales-categories", async (req: Request, res: Response) => {
  const searchQuery = ((req.query.search as string) || "").toLowerCase().trim();

  if (isSupabaseMode && supabase) {
    try {
      // 从 Supabase 查询所有类别
      const { data: categoriesData, error: catError } = await supabase
        .from("sales_categories")
        .select("*")
        .order("id");

      if (catError) throw catError;

      // 查询所有商品
      const { data: itemsData, error: itemError } = await supabase
        .from("sales_items")
        .select("*")
        .order("created_at");

      if (itemError) throw itemError;

      // 组装并支持搜索过滤
      const result = categoriesData.map((cat) => {
        let items = itemsData.filter((i) => i.category_id === cat.id);

        // 搜索逻辑
        if (searchQuery) {
          const catMatch =
            cat.id.includes(searchQuery) || cat.name_key.includes(searchQuery);
          if (!catMatch) {
            items = items.filter(
              (i) =>
                i.name_zh.toLowerCase().includes(searchQuery) ||
                i.name_en.toLowerCase().includes(searchQuery),
            );
          }
        }

        return {
          id: cat.id,
          nameKey: cat.name_key,
          items: items.map((i) => ({
            id: i.id,
            nameZh: i.name_zh,
            nameEn: i.name_en,
            quantity: i.quantity,
            unitPrice: Number(i.unit_price),
            isInternal: i.is_internal,
          })),
        };
      });

      res.json(result);
      return;
    } catch (err) {
      console.error("⚠️ [Supabase] 获取数据出错，自动降级回退至沙箱模式:", err);
    }
  }

  // Fallback / Sandbox 模式下的数据获取
  const result = mockDb.categories.map((cat) => {
    let items = mockDb.items.filter((i) => i.category_id === cat.id);

    if (searchQuery) {
      const catMatch =
        cat.id.includes(searchQuery) || cat.name_key.includes(searchQuery);
      if (!catMatch) {
        items = items.filter(
          (i) =>
            i.name_zh.toLowerCase().includes(searchQuery) ||
            i.name_en.toLowerCase().includes(searchQuery),
        );
      }
    }

    return {
      id: cat.id,
      nameKey: cat.name_key,
      items: items.map((i) => ({
        id: i.id,
        nameZh: i.name_zh,
        nameEn: i.name_en,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        isInternal: i.is_internal,
      })),
    };
  });

  res.json(result);
});

// 3. 销售明细增加新商品
app.post("/api/sales-categories/items", async (req: Request, res: Response) => {
  const { categoryId, nameZh, nameEn, quantity, unitPrice, isInternal } =
    req.body;

  if (
    !categoryId ||
    !nameZh ||
    !nameEn ||
    quantity === undefined ||
    !unitPrice
  ) {
    res.status(400).json({ error: "Missing required parameters" });
    return;
  }

  const itemId = `custom-${Date.now()}`;
  const newItem = {
    id: itemId,
    category_id: categoryId,
    name_zh: nameZh,
    name_en: nameEn,
    quantity: Number(quantity),
    unit_price: Number(unitPrice),
    is_internal: !!isInternal,
  };

  if (isSupabaseMode && supabase) {
    try {
      const { data, error } = await supabase
        .from("sales_items")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: data.id,
        nameZh: data.name_zh,
        nameEn: data.name_en,
        quantity: data.quantity,
        unitPrice: Number(data.unit_price),
        isInternal: data.is_internal,
      });
      return;
    } catch (err) {
      console.error("⚠️ [Supabase] 添加商品出错，降级在沙箱内存中插入:", err);
    }
  }

  // Sandbox 内存插入
  const sandboxItem = {
    id: newItem.id,
    category_id: newItem.category_id,
    name_zh: newItem.name_zh,
    name_en: newItem.name_en,
    quantity: newItem.quantity,
    unit_price: newItem.unit_price,
    is_internal: newItem.is_internal,
  };
  mockDb.items.push(sandboxItem);
  res.json({
    id: sandboxItem.id,
    nameZh: sandboxItem.name_zh,
    nameEn: sandboxItem.name_en,
    quantity: sandboxItem.quantity,
    unitPrice: sandboxItem.unit_price,
    isInternal: sandboxItem.is_internal,
  });
});

// 4. 修改明细商品的销售数量
app.put(
  "/api/sales-items/:id/quantity",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const quantity = Number(req.body.quantity);

    if (isNaN(quantity) || quantity < 0) {
      res.status(400).json({ error: "Invalid quantity value" });
      return;
    }

    if (isSupabaseMode && supabase) {
      try {
        const { data, error } = await supabase
          .from("sales_items")
          .update({ quantity })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        res.json({ success: true, item: data });
        return;
      } catch (err) {
        console.error("⚠️ [Supabase] 更新商品数量出错，回退到内存修改:", err);
      }
    }

    // Sandbox 内存更新
    const index = mockDb.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      mockDb.items[index].quantity = quantity;
      res.json({ success: true, item: mockDb.items[index] });
    } else {
      res.status(404).json({ error: "Item not found in Sandbox memory" });
    }
  },
);

// 5. 删除明细商品
app.delete("/api/sales-items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isSupabaseMode && supabase) {
    try {
      const { error } = await supabase
        .from("sales_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      res.json({ success: true });
      return;
    } catch (err) {
      console.error("⚠️ [Supabase] 删除商品出错，回退内存处理:", err);
    }
  }

  // Sandbox 内存删除
  const initialLength = mockDb.items.length;
  mockDb.items = mockDb.items.filter((i) => i.id !== id);

  if (mockDb.items.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Item not found in Sandbox memory" });
  }
});

// 6. 获取 Dashboard 综合统计数据
app.get("/api/dashboard", async (req: Request, res: Response) => {
  let categories = mockDb.categories;
  let items = mockDb.items;
  let monthly = mockDb.monthlyPerformances;
  let storeRank = mockDb.storeRankings;
  let history = mockDb.historicalTrends;
  let recentTxs = mockDb.transactions.slice(-5).reverse(); // 取最近5条

  if (isSupabaseMode && supabase) {
    try {
      const [
        { data: catData, error: catError },
        { data: itemData, error: itemError },
        { data: monthlyData, error: monError },
        { data: storeData, error: storeError },
        { data: histData, error: histError },
        { data: txData, error: txError },
      ] = await Promise.all([
        supabase.from("sales_categories").select("*"),
        supabase.from("sales_items").select("*"),
        supabase.from("monthly_performances").select("*").order("month_key"),
        supabase.from("store_rankings").select("*").order("rank_number"),
        supabase.from("historical_trends").select("*").order("ym_key"),
        supabase
          .from("blockchain_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (catError) throw catError;
      if (itemError) throw itemError;
      if (monError) throw monError;
      if (storeError) throw storeError;
      if (histError) throw histError;
      if (txError) throw txError;

      if (catData) categories = catData;
      if (itemData) items = itemData;
      if (monthlyData) {
        monthly = monthlyData.map((m) => ({
          month_key: m.month_key,
          mobile: m.mobile,
          accessories: m.accessories,
          large_appliances: m.large_appliances,
          small_appliances: m.small_appliances,
        }));
      }
      if (storeData) {
        storeRank = storeData.map((s) => ({
          store_key: s.store_key,
          rank_number: s.rank_number,
          sales: Number(s.sales),
          date_key: s.date_key,
          percentage: s.percentage,
        }));
      }
      if (histData) {
        history = histData.map((h) => ({
          ym_key: h.ym_key,
          mobile: h.mobile,
          accessories: h.accessories,
          large_appliances: h.large_appliances,
          small_appliances: h.small_appliances,
        }));
      }
      if (txData) {
        recentTxs = txData.map((t) => ({
          id: t.id,
          tx_hash: t.tx_hash,
          status: t.status,
          confirmations: t.confirmations,
          payload: t.payload,
          created_at: t.created_at,
        }));
      }
    } catch (err) {
      console.error(
        "⚠️ [Supabase] 获取 Dashboard 数据出错，自动降级回退至沙箱内存:",
        err,
      );
    }
  }

  // =========================================================================
  // DRY 原则: 基于实际商品明细 items 动态计算 categoriesPieData
  // =========================================================================
  const pieTotals = categories.map((cat) => {
    const catItems = items.filter(
      (i) => (i.category_id || (i as any).categoryId) === cat.id,
    );
    const qty = catItems.reduce((sum, i) => sum + i.quantity, 0);
    const value = catItems.reduce(
      (sum, i) =>
        sum + i.quantity * Number(i.unit_price || (i as any).unitPrice),
      0,
    );
    return {
      id: cat.id,
      nameKey: cat.name_key,
      qty,
      value,
      color: cat.color,
    };
  });

  const grandTotalValue = pieTotals.reduce((sum, c) => sum + c.value, 0);

  const categoriesPie = pieTotals.map((c) => ({
    ...c,
    percentage:
      grandTotalValue > 0 ? Math.round((c.value / grandTotalValue) * 100) : 0,
  }));

  res.json({
    categoriesPie,
    monthlyPerformances: monthly.map((m) => ({
      monthKey: m.month_key,
      data: {
        mobile: m.mobile,
        accessories: m.accessories,
        largeAppliances: m.large_appliances,
        smallAppliances: m.small_appliances,
      },
    })),
    storeRankings: storeRank.map((s) => ({
      rank: s.rank_number,
      storeKey: s.store_key,
      sales: s.sales,
      dateKey: s.date_key,
      percentage: s.percentage,
    })),
    historicalTrends: history.map((h) => ({
      ymKey: h.ym_key,
      mobile: h.mobile,
      accessories: h.accessories,
      largeAppliances: h.large_appliances,
      smallAppliances: h.small_appliances,
    })),
    recentTransactions: recentTxs,
  });
});

// 7. 新增“提交并核验”区块链模拟交易并持久化
app.post("/api/transactions", async (req: Request, res: Response) => {
  const { payload } = req.body;

  const txHash =
    "0x4f2da46bb22f1e89zpk2" +
    Math.floor(1000 + Math.random() * 9000) +
    "ab88e1e89fbc00938f9b9e1a";
  const newTx = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tx_hash: txHash,
    status: "pending",
    confirmations: 0,
    payload: payload || {},
    created_at: new Date().toISOString(),
  };

  if (isSupabaseMode && supabase) {
    try {
      const { data, error } = await supabase
        .from("blockchain_transactions")
        .insert({
          tx_hash: newTx.tx_hash,
          status: newTx.status,
          confirmations: newTx.confirmations,
          payload: newTx.payload,
        })
        .select()
        .single();

      if (error) throw error;

      // 异步执行：模拟 6 次确认的后台定时累加器（并在 Supabase 中实时更新，实现真正的持久化跳跃！）
      let currentConfirmations = 0;
      const interval = setInterval(async () => {
        currentConfirmations += 1;
        const isFinished = currentConfirmations >= 6;

        try {
          await supabase!
            .from("blockchain_transactions")
            .update({
              confirmations: currentConfirmations,
              status: isFinished ? "success" : "pending",
            })
            .eq("id", data.id);
        } catch (updateErr) {
          console.error("❌ 后台更新交易确认数出错:", updateErr);
        }

        if (isFinished) {
          clearInterval(interval);
        }
      }, 1000);

      res.json({
        id: data.id,
        txHash: data.tx_hash,
        status: data.status,
        confirmations: data.confirmations,
      });
      return;
    } catch (err) {
      console.error("⚠️ [Supabase] 上链模拟交易失败，降级切换沙箱运行:", err);
    }
  }

  // Sandbox 内存模式下的事务处理与定时累加
  mockDb.transactions.push(newTx);

  let currentConfirmations = 0;
  const interval = setInterval(() => {
    currentConfirmations += 1;
    const index = mockDb.transactions.findIndex((t) => t.id === newTx.id);
    if (index !== -1) {
      mockDb.transactions[index].confirmations = currentConfirmations;
      if (currentConfirmations >= 6) {
        mockDb.transactions[index].status = "success";
        clearInterval(interval);
      }
    } else {
      clearInterval(interval);
    }
  }, 1000);

  res.json({
    id: newTx.id,
    txHash: newTx.tx_hash,
    status: newTx.status,
    confirmations: newTx.confirmations,
  });
});

// 托管静态产物 (生产模式)
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `🚀 [Server] Smart Retail 链上融合后端就绪。监听地址: http://localhost:${PORT}`,
  );
});
