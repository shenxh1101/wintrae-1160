import type {
  Project,
  DesignGroup,
  Version,
  TimelineEvent,
  DeliveryItem,
  User,
} from "../types";

const designer: User = {
  id: "u1",
  name: "李明远",
  role: "designer",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
};

const client: User = {
  id: "u2",
  name: "张总",
  role: "client",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
};

export const project: Project = {
  id: "p1",
  title: "云端科技品牌视觉升级",
  client: "云端科技有限公司",
  description:
    "为云端科技进行全面的品牌视觉升级，包括 Logo 优化、品牌色彩系统、UI 组件库以及营销物料设计。目标是打造更现代、更专业的品牌形象，提升市场竞争力。",
  coverImage:
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1600&h=800&fit=crop",
  startDate: "2026-04-01",
  endDate: "2026-07-15",
  status: "review",
  progress: 68,
};

export const designGroups: DesignGroup[] = [
  {
    id: "g1",
    name: "首页设计",
    description: "品牌官网首页及关键着陆页",
    designs: [
      {
        id: "d1",
        title: "首页 - 英雄区域",
        description: "首屏主视觉，包含新 Logo、标语和主要 CTA",
        imageUrl:
          "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&h=800&fit=crop",
        version: 3,
        status: "pending",
        annotations: [
          {
            id: "a1",
            designId: "d1",
            x: 15,
            y: 20,
            content: "Logo 的尺寸可以再放大一些，现在看起来有点小，不够突出。",
            priority: "high",
            status: "open",
            author: client,
            comments: [
              {
                id: "c1",
                annotationId: "a1",
                content: "好的，我来调整一下 Logo 尺寸，放大 15%。",
                author: designer,
                createdAt: "2026-06-10T14:30:00",
              },
            ],
            createdAt: "2026-06-10T11:20:00",
          },
          {
            id: "a2",
            designId: "d1",
            x: 75,
            y: 65,
            content: "主按钮的颜色是否可以调整为更深一些的橙色？",
            priority: "medium",
            status: "resolved",
            author: client,
            comments: [],
            createdAt: "2026-06-10T11:25:00",
          },
        ],
        createdAt: "2026-06-08T09:00:00",
      },
      {
        id: "d2",
        title: "首页 - 产品特性",
        description: "产品核心功能展示区域",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
        version: 2,
        status: "approved",
        annotations: [],
        createdAt: "2026-06-05T14:30:00",
      },
      {
        id: "d3",
        title: "首页 - 客户案例",
        description: "合作伙伴和客户 Logo 展示区",
        imageUrl:
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop",
        version: 2,
        status: "pending",
        annotations: [
          {
            id: "a3",
            designId: "d3",
            x: 50,
            y: 50,
            content: "建议增加客户的 testimonial 引用，增强说服力。",
            priority: "low",
            status: "open",
            author: client,
            comments: [],
            createdAt: "2026-06-11T09:15:00",
          },
        ],
        createdAt: "2026-06-07T11:00:00",
      },
    ],
  },
  {
    id: "g2",
    name: "产品页面",
    description: "产品详情与功能介绍页面",
    designs: [
      {
        id: "d4",
        title: "产品列表页",
        description: "所有产品的卡片式列表展示",
        imageUrl:
          "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&h=800&fit=crop",
        version: 3,
        status: "revision",
        annotations: [
          {
            id: "a4",
            designId: "d4",
            x: 30,
            y: 40,
            content: "产品卡片之间的间距需要调整，现在感觉太拥挤了。",
            priority: "high",
            status: "open",
            author: client,
            comments: [
              {
                id: "c2",
                annotationId: "a4",
                content: "收到，下版本会增加间距，同时调整卡片阴影效果。",
                author: designer,
                createdAt: "2026-06-11T16:20:00",
              },
            ],
            createdAt: "2026-06-11T15:45:00",
          },
        ],
        createdAt: "2026-06-06T10:00:00",
      },
      {
        id: "d5",
        title: "产品详情页",
        description: "单个产品的详细信息展示",
        imageUrl:
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=800&fit=crop",
        version: 2,
        status: "approved",
        annotations: [],
        createdAt: "2026-06-09T13:30:00",
      },
    ],
  },
  {
    id: "g3",
    name: "关于我们",
    description: "公司介绍与团队展示页面",
    designs: [
      {
        id: "d6",
        title: "公司介绍",
        description: "公司历史、愿景和价值观",
        imageUrl:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
        version: 2,
        status: "pending",
        annotations: [
          {
            id: "a5",
            designId: "d6",
            x: 80,
            y: 30,
            content: "时间线的样式可以更现代一些吗？",
            priority: "medium",
            status: "open",
            author: client,
            comments: [],
            createdAt: "2026-06-12T10:30:00",
          },
        ],
        createdAt: "2026-06-08T15:00:00",
      },
      {
        id: "d7",
        title: "团队成员",
        description: "核心团队成员介绍",
        imageUrl:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop",
        version: 1,
        status: "pending",
        annotations: [],
        createdAt: "2026-06-12T09:00:00",
      },
      {
        id: "d8",
        title: "联系我们",
        description: "联系方式和表单",
        imageUrl:
          "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=800&fit=crop",
        version: 1,
        status: "revision",
        annotations: [
          {
            id: "a6",
            designId: "d8",
            x: 60,
            y: 70,
            content: "表单需要增加验证码功能，防止垃圾邮件。",
            priority: "high",
            status: "resolved",
            author: client,
            comments: [
              {
                id: "c3",
                annotationId: "a6",
                content: "已添加图形验证码，请查看最新版本。",
                author: designer,
                createdAt: "2026-06-12T14:00:00",
              },
            ],
            createdAt: "2026-06-12T11:30:00",
          },
        ],
        createdAt: "2026-06-11T16:00:00",
      },
    ],
  },
];

export const versions: Version[] = [
  {
    id: "v3",
    number: 3,
    name: "第三轮提案",
    description: "根据客户第二轮反馈进行的优化调整",
    designIds: ["d1", "d4", "d6", "d7", "d8"],
    createdAt: "2026-06-12T10:00:00",
    changes: [
      {
        id: "ch1",
        type: "modified",
        description: "首页 Logo 尺寸放大 15%，位置微调",
        designId: "d1",
        confirmed: false,
      },
      {
        id: "ch2",
        type: "modified",
        description: "产品列表页卡片间距增加，优化阴影效果",
        designId: "d4",
        confirmed: false,
      },
      {
        id: "ch3",
        type: "modified",
        description: "联系页面添加图形验证码功能",
        designId: "d8",
        confirmed: true,
      },
      {
        id: "ch4",
        type: "added",
        description: "新增团队成员展示页面",
        designId: "d7",
        confirmed: false,
      },
      {
        id: "ch5",
        type: "modified",
        description: "关于页面时间线样式优化",
        designId: "d6",
        confirmed: false,
      },
    ],
  },
  {
    id: "v2",
    number: 2,
    name: "第二轮提案",
    description: "基于第一轮反馈的整体优化",
    designIds: ["d1", "d2", "d3", "d4", "d5", "d6"],
    createdAt: "2026-06-08T14:00:00",
    changes: [
      {
        id: "ch6",
        type: "modified",
        description: "主按钮颜色调整为更深的橙色",
        designId: "d1",
        confirmed: true,
      },
      {
        id: "ch7",
        type: "modified",
        description: "产品特性区域图标重新设计",
        designId: "d2",
        confirmed: true,
      },
      {
        id: "ch8",
        type: "added",
        description: "新增客户案例页面",
        designId: "d3",
        confirmed: true,
      },
      {
        id: "ch9",
        type: "modified",
        description: "产品详情页布局调整，增加图片轮播",
        designId: "d5",
        confirmed: true,
      },
    ],
  },
  {
    id: "v1",
    number: 1,
    name: "首轮提案",
    description: "完整的品牌视觉方案初稿",
    designIds: ["d1", "d2", "d4", "d5", "d6"],
    createdAt: "2026-06-01T10:00:00",
    changes: [
      {
        id: "ch10",
        type: "added",
        description: "初始版本提交，包含首页、产品页、关于页",
        confirmed: true,
      },
    ],
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "t8",
    type: "version",
    title: "第三轮提案提交",
    description: "已根据反馈完成所有修改，提交最终版本确认",
    date: "2026-06-12T10:00:00",
    user: designer,
  },
  {
    id: "t7",
    type: "annotation",
    title: "客户添加新批注",
    description: "在关于页面和联系页面添加了 3 条新批注",
    date: "2026-06-12T08:30:00",
    user: client,
  },
  {
    id: "t6",
    type: "status",
    title: "项目状态更新",
    description: "从「修改中」变更为「审核中」",
    date: "2026-06-11T17:00:00",
    user: designer,
  },
  {
    id: "t5",
    type: "annotation",
    title: "客户确认修改",
    description: "已确认产品详情页和客户案例页的修改",
    date: "2026-06-11T10:15:00",
    user: client,
  },
  {
    id: "t4",
    type: "version",
    title: "第二轮提案提交",
    description: "根据第一轮反馈完成优化，共 5 处主要改动",
    date: "2026-06-08T14:00:00",
    user: designer,
  },
  {
    id: "t3",
    type: "annotation",
    title: "第一轮反馈完成",
    description: "客户共提交 8 条批注，其中高优先级 3 条",
    date: "2026-06-05T16:30:00",
    user: client,
  },
  {
    id: "t2",
    type: "status",
    title: "项目启动",
    description: "双方确认合作意向，项目正式启动",
    date: "2026-04-01T09:00:00",
    user: designer,
  },
  {
    id: "t1",
    type: "status",
    title: "项目创建",
    description: "设计师创建「云端科技品牌视觉升级」项目",
    date: "2026-03-28T11:00:00",
    user: designer,
  },
];

export const deliveryItems: DeliveryItem[] = [
  {
    id: "dl1",
    name: "Logo 源文件包",
    description: "包含 AI、EPS、SVG、PNG 等格式，适配各种使用场景",
    fileType: "ZIP",
    fileSize: "24.5 MB",
    completed: true,
  },
  {
    id: "dl2",
    name: "品牌色彩系统规范",
    description: "PDF 文档，详细说明品牌色彩使用规范",
    fileType: "PDF",
    fileSize: "3.2 MB",
    completed: true,
  },
  {
    id: "dl3",
    name: "UI 设计源文件",
    description: "Figma 设计文件，包含所有页面和组件",
    fileType: "FIG",
    fileSize: "156 MB",
    completed: false,
  },
  {
    id: "dl4",
    name: "图标库",
    description: "自定义图标集，SVG 格式，共 48 个图标",
    fileType: "ZIP",
    fileSize: "1.8 MB",
    completed: true,
  },
  {
    id: "dl5",
    name: "品牌视觉手册",
    description: "完整的品牌视觉使用指南 PDF",
    fileType: "PDF",
    fileSize: "12.4 MB",
    completed: false,
  },
  {
    id: "dl6",
    name: "切图标注资源",
    description: "所有页面的切图和标注文件",
    fileType: "ZIP",
    fileSize: "45.2 MB",
    completed: false,
  },
];

export const currentUser = designer;
export const currentClient = client;
