# ARCHITECTURE — 數據模型與流程

## 實體關係
Region（區域）
  └─ 含多個 Case / Solution / PainPoint / Intro
  └─ 各內容實體皆有 regionId 外鍵，隸屬於一個 Region

PainPoint（痛點）
  ├─ 多對多 ↔ Case
  └─ 多對多 ↔ Solution

Case（案例，公開）
  └─ 多對多 ↔ Solution

Solution（方案，後台為主）
  └─ 多對多 ↔ PainPoint

Application（申請）
  ├─ 記錄來源 Case（card 數據）
  ├─ 記錄當下痛點快照（可多個）
  ├─ 痛點來源：申請表自動帶入該 Case 關聯的痛點，用戶可勾選（A+B）
  └─ 狀態：pending / processed

## Admin 驗證
- NextAuth，僅 admin 一個角色
- 所有後台操作走 protectedProcedure

## 關聯規則
- 一個 Case ↔ 多個 Solution
- 一個 Solution ↔ 多個 Case
- 一個 Case ↔ 多個 PainPoint
- 一個 Solution ↔ 多個 PainPoint
- 多對多一律使用顯式關聯表

## 相關案例判定
共用任一 PainPoint 或 共用任一 Solution → 視為相關。

## 用戶流程
1. GET 案例 card 列表
2. 點 card → localStorage 存 { caseId, ... }
3. 申請表讀 localStorage，自動帶入該 Case 的痛點供勾選 → tRPC 提交
4. Application 寫入 DB（含勾選的痛點快照）
5. Admin 後台查看與處理

## Admin 職責
- CRUD：Region / PainPoint / Case / Solution / Intro
- 查看與處理 Application
- 建立各區域內容
