# 🛰️ Aether Orbital Terminal // 终极航天战术遥测视界

<div align="center">

![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-black?style=for-the-badge&logo=threedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?style=for-the-badge&logo=githubpages&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Awwwards 年度网站审美标杆 · 3D WebGL PBR 空间站与天体航天测控中心 (Project Aether-9)**

[🚀 在线体验 Demo (GitHub Pages)](https://yuheng-123.github.io/aether-orbital-terminal/) • [核心特性](#-核心特性矩阵) • [技术架构](#-系统架构) • [交互指南](#-操控与交互指引)

</div>

---

## 🌌 项目概述 (Overview)

**Aether Orbital Terminal** 是一套融合了**瑞士现代主义工业排版 (Swiss Style)** 与**先锋科幻战术 HUD 交互 (Sci-Fi Cyber-Aesthetics)** 的近地轨道战术遥测工作台。

项目深度整合了 **Three.js WebGL 物理渲染管线**，实现了空间站与地球的真实轨道力学仿真、NASA NORAD 25544 真实星下点遥测对接、3D 实时世界坐标向 2D HUD 屏幕的投影引线锚定、宇航员第一人称穹顶漫游（VR Cam）、Web Audio 48Hz 低频舱压引擎合成器，以及太阳系开普勒天体仪。

---

## ✨ 核心特性矩阵 (Key Features)

### 1. 🛰️ 真实 ISS 实时经纬度对接 (Real Live Telemetry // NORAD 25544)
- 实时接入 NASA / Celestrak 开放遥测数据流，以秒级频率流式同步国际空间站真实的星下点经纬度、轨道海拔（~420km）、轨道极速（~27,600 km/h）与地平圈覆盖。
- 动态映射至 3D 旋转地球地表坐标系与 2D 墨卡托雷达大圆轨迹投影台。

### 2. 🥽 空间站第一人称舷窗漫游 (Cupola VR Cam)
- 配备“宇航员第一视角（ASTRONAUT POV）”预设镜头机位，摄像机平滑滑行嵌入穹顶观测舱（Cupola）7扇舷窗核心，以第一人称超广角俯瞰脚下缓慢转动的蔚蓝母星与晨昏线。

### 3. 🔊 空间站低频引擎与深空战术环境音 (Synthesized Web Audio API)
- 零外部音频文件加载，纯原生 Web Audio 实时物理震荡器合成：
  - **48Hz Sub-bass 舱体气压循环低频引擎共振 (Brown Noise)**
  - **太阳耀斑防灾警报 (Klaxon Siren)**
  - **RCS 微推进器气动喷气声 (Pneumatic Thruster Whoosh)**
  - **测控雷达与引线锁定蜂鸣 (Tactical Bips & Downlink Chirps)**

### 4. 🛰️ 3D-to-2D 实时屏幕投影全息战术引线 (HUD Raycasting & Projections)
- 战术引线实时锚定国际空间站 3D 模型关键舱体：**穹顶观测舱 (Cupola)**、**主对接舱 (PMA)**、**核心实验舱 (Destiny)** 与 **双侧太阳能光伏翼 (Solar Arrays)**。
- 点击引线卡片即刻触发镜头平滑滑翔特写（Smooth Camera Slerp / Tween），无缝漫游舱段细节。

### 5. 🌍 360° 自由天体视角与电影级航天运镜
- **多预设战术机位**：空间站特写、地球全貌轨道、穹顶舷窗漫游、对地俯瞰、深空广角。
- **自由运镜**：左键 360° 空间轨道旋转，右键无级平移，滚轮空间缩放。
- 高分辨率地表漫反射与法线贴图、晨昏昼夜交界线着色与高空大气散射光晕。

### 6. 🚨 太阳耀斑防御模式 (RED ALERT 防灾警报)
- 一键激活空间站最高防灾等级：全屏战术红移闪烁、低频警报蜂鸣。
- 模拟南北极高空极光粒子爆发与高能带电粒子流，双侧太阳翼自动向安全角度侧切避险。

### 7. 🗺️ 2D 墨卡托实时星下点轨迹雷达 (Mercator Ground Track Radar)
- 严谨绘制 ISS 51.6° 倾角真实大圆正弦波投影轨道。
- 星下点覆盖地平圈（Footprint Circle）、昼夜分界线、以及休斯顿、拜科努尔、北京等全球测控地面站同步通信信标。

### 5. 🪐 3D 太阳系八大行星与地月运转轨道仪 (Orrery Mode)
- 开普勒公转轨迹拟真、真实月相盈亏变化、土星环与木星大红斑特征渲染。
- 支持自由缩放并点击无缝飞跃到太阳系任一行星近地视角。

### 6. ⏱️ 交互式偏航角与开普勒时间流速控制器
- 支持太阳翼偏航俯仰角手动微调，实时计算光电转换效率。
- 提供 `1X / 10X / 50X / 暂停` 开普勒时间流速加速控制。

---

## 🛠️ 技术架构 (Tech Stack & Architecture)

```
aether-orbital-terminal/
├── public/                     # 3D 资产与天体材质
│   ├── earth_clouds.jpg        # 动态云层贴图
│   ├── earth_day.jpg           # 日间高精地表
│   ├── earth_night.jpg         # 夜间城市灯光夜景
│   └── iss.glb                 # 空间站高精度 PBR 3D 模型
├── src/
│   ├── components/
│   │   ├── Orbital3DCanvas.jsx         # Three.js 核心 3D 渲染画布与着色器
│   │   ├── MercatorGroundTrackRadar.jsx# 2D 墨卡托实时地面轨迹投影台
│   │   ├── SolarSystemOrrery.jsx       # 太阳系天体仪与行星轨道模拟
│   │   ├── TelemetryDeck.jsx           # 战术遥测数据甲板与系统监测
│   │   ├── ModuleInspectionDrawer.jsx  # 舱体全息深度检视抽屉
│   │   └── TopBar.jsx                  # 战术顶部导航与状态条
│   ├── utils/
│   │   └── audio.js                    # Web Audio API 战术音效发生器
│   ├── App.jsx                         # 主应用布局与全局状态总线
│   └── main.jsx                        # 挂载入口
└── vite.config.js
```

---

## 🚀 快速启动与本地运行 (Quick Start)

### 环境依赖
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与启动
```bash
# 1. 克隆仓库
git clone https://github.com/YuHeng-123/aether-orbital-terminal.git
cd aether-orbital-terminal

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev -- --port 5173
```

启动后在浏览器中打开：`http://localhost:5173/`

### 构建生产包
```bash
npm run build
npm run preview
```

---

## 🎮 操控与交互指引 (Controls)

| 操作 | 鼠标 / 按键 | 说明 |
| :--- | :--- | :--- |
| **旋转视角** | 鼠标左键按住拖拽 | 围绕空间站 / 地球 360° 旋转轨道相机 |
| **平移镜头** | 鼠标右键按住拖拽 | 在视口平面内平移战术准心 |
| **视距缩放** | 滚轮上下滚动 | 从近距舱体微距到深空广角无级过渡 |
| **检视舱段** | 单击 3D 浮动引线标签 | 摄像机平滑飞跃至对应舱段特写 |
| **警报演练** | 顶部 `RED ALERT` 按钮 | 触发全站粒子暴告警与极光声光交互 |

---

## 📄 开源许可 (License)

本项目采用 [MIT License](LICENSE) 开源协议。
