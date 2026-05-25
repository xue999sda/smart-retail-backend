-- =========================================================================
-- Smart Retail 链上管理系统 - Supabase SQL 初始化脚本
-- 设计原则: 高可读性、严谨的实体关联性、真实 Web4.0 交易追溯
-- =========================================================================

-- 启用 UUID 生成扩展（若尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 销售品类大类表 (Sales Categories)
CREATE TABLE IF NOT EXISTS sales_categories (
    id TEXT PRIMARY KEY,                       -- 品类唯一标识，例如 'mobile', 'accessories'
    name_key TEXT NOT NULL,                    -- 用于多语言翻译翻译字典的键值，例如 'phone_devices'
    color TEXT NOT NULL,                       -- 霓虹色彩渲染的 CSS Hex 码，例如 '#3b82f6'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 添加中文注释重点解释“Why” (根据全局规范要求)
COMMENT ON TABLE sales_categories IS '销售品类大类表。Why: 销售类别为系统核心聚合根，其本身不冗余存储动态计算的 value 和 qty，而是在 API 层面通过 items 动态求和得到，确保数据单一真理源 (Single Source of Truth) 并践行 SOLID 原则。';

-- 2. 品类明细商品表 (Sales Items)
CREATE TABLE IF NOT EXISTS sales_items (
    id TEXT PRIMARY KEY,                       -- 商品唯一标识 (如 'm-tecno', 'custom-1234')
    category_id TEXT NOT NULL REFERENCES sales_categories(id) ON DELETE CASCADE,
    name_zh TEXT NOT NULL,                     -- 中文商品展示名
    name_en TEXT NOT NULL,                     -- 英文商品展示名
    quantity INTEGER NOT NULL DEFAULT 0,       -- 当前销售录入数量
    unit_price NUMERIC(12, 2) NOT NULL,        -- 商品单价（美元）
    is_internal BOOLEAN NOT NULL DEFAULT false,-- 是否为自有内部品牌
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE sales_items IS '具体商品明细表。Why: 支撑 SalesEntryView 每一行物料的实时录入。支持外键级联删除，以简化品类清理时的事务开销。';

-- 3. 月度表现表现表 (Monthly Performance)
CREATE TABLE IF NOT EXISTS monthly_performances (
    month_key TEXT PRIMARY KEY,                -- 月份索引键，例如 'm1', 'm2'
    mobile INTEGER NOT NULL DEFAULT 0,
    accessories INTEGER NOT NULL DEFAULT 0,
    large_appliances INTEGER NOT NULL DEFAULT 0,
    small_appliances INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE monthly_performances IS '月度柱状图轨迹表现表。Why: 用于记录和绘制过去七个月各类别商品销售件数的宏观趋势。';

-- 4. 门店销售排行表 (Store Rankings)
CREATE TABLE IF NOT EXISTS store_rankings (
    store_key TEXT PRIMARY KEY,                -- 门店字典键，例如 'store_1', 'store_2'
    rank_number INTEGER NOT NULL,              -- 门店当前排名 1, 2, 3
    sales NUMERIC(12, 2) NOT NULL DEFAULT 0,   -- 销售总额（美元）
    date_key TEXT NOT NULL,                    -- 日期标识，例如 'date_range_1'
    percentage INTEGER NOT NULL DEFAULT 0      -- 占比百分数，用于进度条视觉宽度绘制
);

COMMENT ON TABLE store_rankings IS '各门店销售表现排行表。Why: 解决多门店在不同日期范围内的销售业绩横向对比与进度条计算展示需求。';

-- 5. 历史宏观折线趋势表 (Historical Trends)
CREATE TABLE IF NOT EXISTS historical_trends (
    ym_key TEXT PRIMARY KEY,                   -- 年月度标识，例如 'ym1', 'ym2'
    mobile INTEGER NOT NULL DEFAULT 0,
    accessories INTEGER NOT NULL DEFAULT 0,
    large_appliances INTEGER NOT NULL DEFAULT 0,
    small_appliances INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE historical_trends IS '历史品类销售量趋势表。Why: 记录多月跨度的销量折线，对应 Dashboard 底部 spline 折线图，提供对未来销量走向的宏观研判依据。';

-- 6. 区块链模拟交易日志表 (Blockchain Transactions Ledger)
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash TEXT NOT NULL UNIQUE,              -- 唯一的模拟上链交易哈希
    status TEXT NOT NULL,                      -- 状态: 'pending' 或 'success'
    confirmations INTEGER NOT NULL DEFAULT 0,  -- 区块确认数，上线后递增至 6 次代表全网共识完毕
    payload JSONB NOT NULL,                    -- 上链时的明细数据快照
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE blockchain_transactions IS '去中心化链上核验交易日志。Why: 真实沉淀每一次“提交并核验”的操作，为系统提供 Web4.0 追溯性，供区块链浏览器和前端最近交易组件查询。';

-- =========================================================================
-- 种子数据初始化 (Seed Data Setup)
-- =========================================================================

-- 初始化品类大类
INSERT INTO sales_categories (id, name_key, color) VALUES
('mobile', 'phone_devices', '#3b82f6'),
('accessories', 'accessories', '#10b981'),
('large', 'large_appliances', '#ef4444'),
('small', 'small_appliances', '#a855f7')
ON CONFLICT (id) DO NOTHING;

-- 初始化明细商品
INSERT INTO sales_items (id, category_id, name_zh, name_en, quantity, unit_price, is_internal) VALUES
-- 手机大类
('m-tecno', 'mobile', 'TECNO', 'TECNO', 45, 410.00, false),
('m-infinix', 'mobile', 'Infinix', 'Infinix', 32, 400.00, false),
('m-itel', 'mobile', 'ITEL', 'ITEL', 28, 414.28, false),
-- 手机配件类
('a-own', 'accessories', '自有品牌', 'Own Brand', 120, 45.00, true),
('a-other', 'accessories', '非自有品牌', 'Other Brand', 85, 32.00, false),
-- 大家电类
('l-fridge', 'large', '冰箱', 'Fridge', 12, 3500.00, false),
('l-tv', 'large', '电视', 'TV', 24, 1500.00, false),
('l-freezer', 'large', '冰柜', 'Freezer', 8, 2300.00, false),
('l-ac', 'large', '空调', 'AC', 15, 2500.00, false),
('l-washer', 'large', '洗衣机', 'Washer', 6, 2400.00, false),
('l-fan', 'large', '风扇', 'Fan', 45, 100.00, false),
('l-microwave', 'large', '微波炉', 'Microwave', 10, 180.00, false),
('l-cooker', 'large', '灶具', 'Cooker', 4, 450.00, false),
-- 小家电类
('s-own', 'small', '自有品牌', 'Own Brand', 56, 253.57, true),
('s-other', 'small', '非自有品牌', 'Other Brand', 34, 315.58, false)
ON CONFLICT (id) DO NOTHING;

-- 初始化月度表现
INSERT INTO monthly_performances (month_key, mobile, accessories, large_appliances, small_appliances) VALUES
('m1', 30, 20, 15, 10),
('m2', 45, 35, 25, 15),
('m3', 35, 25, 40, 20),
('m4', 60, 50, 30, 25),
('m5', 75, 60, 45, 30),
('m6', 55, 45, 50, 35),
('m7', 85, 70, 60, 40)
ON CONFLICT (month_key) DO NOTHING;

-- 初始化门店排行
INSERT INTO store_rankings (store_key, rank_number, sales, date_key, percentage) VALUES
('store_1', 1, 23104.00, 'date_range_1', 82),
('store_2', 2, 4935.00, 'date_range_2', 18),
('store_3', 3, 0.00, 'date_range_1', 0)
ON CONFLICT (store_key) DO NOTHING;

-- 初始化历史跨度折线
INSERT INTO historical_trends (ym_key, mobile, accessories, large_appliances, small_appliances) VALUES
('ym1', 80, 50, 20, 10),
('ym2', 120, 90, 40, 15),
('ym3', 100, 70, 80, 30),
('ym4', 150, 110, 60, 35),
('ym5', 220, 180, 120, 50),
('ym6', 240, 210, 110, 65)
ON CONFLICT (ym_key) DO NOTHING;
