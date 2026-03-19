# MimamoriBridge - 設計書

## 概要

離れて暮らす高齢の親の「生活リズム」を穏やかに見守るアプリ。
GPS不使用・キャリアフリー・親の負担ゼロ。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | React Native (Expo SDK 52) |
| 言語 | TypeScript |
| バックエンド | Supabase (Auth, Database, Realtime, Edge Functions) |
| プッシュ通知 | Expo Notifications |
| ヘルスデータ | expo-health (HealthKit / Google Fit) |
| 位置検知 | expo-location (Significant Changes) |
| 状態管理 | Zustand |
| ナビゲーション | Expo Router (file-based) |
| スタイリング | NativeWind (Tailwind CSS for RN) |

## ユーザーフロー

### ロール

1. **見守る側 (Watcher)**: 30-50代の子世代。ダッシュボードで親の状態を確認
2. **見守られる側 (Senior)**: 60-80代の親世代。アプリをインストールするだけ

### 初回セットアップ

```
[Watcher]
1. アプリDL → アカウント作成（メール or Apple ID）
2. 「家族を招待」→ 招待コード生成（6桁 or QRコード）
3. 招待コードを親に伝える（電話/LINE等）

[Senior]
1. アプリDL → 招待コード入力
2. HealthKitアクセス許可
3. 通知許可
4. （任意）位置情報許可（Significant Changes）
5. 完了 → 以後操作不要
```

### 日常フロー

```
[Senior側 - 自動]
07:00  ローカル通知「おはようございます。タップで元気を伝えましょう」
       → タップ → サーバーに check_in 送信
       → 未タップ → 08:00 リマインド → 09:00 未応答なら Watcher に通知

[Senior側 - バックグラウンド]
- HealthKit歩数データを1時間ごとにサーバー送信
- Significant Location Changes でイベント送信（任意）

[Watcher側]
- ダッシュボードで確認:
  - 最終チェックイン時刻
  - 今日の歩数（昨日との比較）
  - 最終活動検知時刻
- 異常時のみプッシュ通知受信
```

## データモデル (Supabase)

### users
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
email           text UNIQUE NOT NULL
display_name    text NOT NULL
role            text NOT NULL CHECK (role IN ('watcher', 'senior'))
avatar_url      text
timezone        text DEFAULT 'Asia/Tokyo'
created_at      timestamptz DEFAULT now()
```

### families
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text NOT NULL
invite_code     text UNIQUE NOT NULL
created_by      uuid REFERENCES users(id)
created_at      timestamptz DEFAULT now()
```

### family_members
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id       uuid REFERENCES families(id) ON DELETE CASCADE
user_id         uuid REFERENCES users(id) ON DELETE CASCADE
role            text NOT NULL CHECK (role IN ('watcher', 'senior'))
joined_at       timestamptz DEFAULT now()
UNIQUE(family_id, user_id)
```

### check_ins
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
senior_id       uuid REFERENCES users(id)
family_id       uuid REFERENCES families(id)
type            text NOT NULL CHECK (type IN ('morning', 'manual', 'tap_response'))
responded_at    timestamptz
created_at      timestamptz DEFAULT now()
```

### health_signals
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
senior_id       uuid REFERENCES users(id)
family_id       uuid REFERENCES families(id)
signal_type     text NOT NULL CHECK (signal_type IN ('steps', 'location_change', 'battery', 'app_active'))
value           jsonb NOT NULL  -- { steps: 1234 } or { event: 'departed' }
recorded_at     timestamptz NOT NULL
created_at      timestamptz DEFAULT now()
```

### alerts
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id       uuid REFERENCES families(id)
senior_id       uuid REFERENCES users(id)
alert_type      text NOT NULL CHECK (alert_type IN ('no_checkin', 'low_steps', 'no_activity', 'manual'))
message         text
resolved_at     timestamptz
created_at      timestamptz DEFAULT now()
```

### notification_settings
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES users(id) UNIQUE
checkin_time    time DEFAULT '07:00'
reminder_delay  interval DEFAULT '60 minutes'
alert_delay     interval DEFAULT '120 minutes'
steps_threshold integer DEFAULT 100  -- 午前中にこれ以下なら注意
quiet_hours_start time DEFAULT '22:00'
quiet_hours_end   time DEFAULT '06:00'
expo_push_token text
updated_at      timestamptz DEFAULT now()
```

## ファイル構成

```
mimamori-bridge/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (auth check)
│   ├── index.tsx                 # Landing / redirect
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── join.tsx              # 招待コード入力
│   ├── (watcher)/
│   │   ├── _layout.tsx           # Tab navigation
│   │   ├── index.tsx             # ダッシュボード
│   │   ├── family.tsx            # 家族管理・招待
│   │   └── settings.tsx          # 通知設定
│   └── (senior)/
│       ├── _layout.tsx
│       ├── index.tsx             # シンプルホーム（大きな「元気」ボタン）
│       └── settings.tsx          # 通知時間設定
├── components/
│   ├── ui/                       # 共通UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   └── StatusBadge.tsx
│   ├── watcher/
│   │   ├── SeniorCard.tsx        # 見守り対象の状態カード
│   │   ├── StepsChart.tsx        # 歩数グラフ
│   │   ├── ActivityTimeline.tsx  # 活動タイムライン
│   │   └── AlertBanner.tsx       # アラートバナー
│   └── senior/
│       ├── CheckInButton.tsx     # 大きな「元気です」ボタン
│       └── StatusDisplay.tsx     # 自分の状態表示
├── hooks/
│   ├── useAuth.ts
│   ├── useFamily.ts
│   ├── useHealthKit.ts           # HealthKit連携
│   ├── useBackgroundTasks.ts     # バックグラウンドタスク
│   ├── useNotifications.ts       # プッシュ通知
│   └── useLocation.ts            # Significant Location
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── notifications.ts          # 通知ロジック
│   └── anomaly.ts                # 異常検知ルール
├── store/
│   └── useStore.ts               # Zustand store
├── constants/
│   ├── colors.ts
│   └── config.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── functions/
│       ├── check-anomaly/        # 異常検知 Edge Function
│       ├── send-checkin/         # チェックイン通知送信
│       └── daily-report/        # 日次レポート生成
├── assets/
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── .env.example
```

## 実装フェーズ

### Phase 1: 基盤 + 認証 + 家族招待（Day 1-2）
- Expo プロジェクト作成（SDK 52, TypeScript, Expo Router）
- NativeWind セットアップ
- Supabase プロジェクト作成 + DB マイグレーション
- Auth（メール + Apple ID）
- 家族作成 + 招待コード生成/入力
- ロール分岐ルーティング（watcher/senior）

### Phase 2: Senior側 - チェックイン機能（Day 3-4）
- ローカル通知設定（毎朝の「おはよう」通知）
- 大きな「元気です」ボタンUI
- チェックイン → Supabase 送信
- Expo Push Token登録
- Senior向けシンプルUI（大きな文字、高コントラスト）

### Phase 3: Watcher側 - ダッシュボード（Day 5-6）
- 見守り対象の状態カード
- チェックイン履歴表示
- Supabase Realtime で状態リアルタイム更新
- 手動「元気？」通知送信機能

### Phase 4: HealthKit連携（Day 7-8）
- expo-health セットアップ
- 歩数データ取得 + バックグラウンド配信
- 歩数データ → Supabase 送信
- Watcher側に歩数表示 + 昨日比較

### Phase 5: 異常検知 + アラート（Day 9-10）
- Supabase Edge Function: 異常検知ロジック
  - チェックイン未応答（設定時間超過）
  - 歩数が閾値以下（午前中に100歩未満など）
- アラート生成 → Watcher にプッシュ通知
- アラート履歴表示

### Phase 6: 仕上げ + テスト（Day 11-14）
- Significant Location Changes（Phase 2機能）
- 通知設定カスタマイズUI
- オンボーディングフロー（親にインストールしてもらう手順ガイド）
- アクセシビリティ対応（Senior向け: 大文字、高コントラスト）
- 多言語対応（日本語/英語）
- プライバシーポリシー
- App Store 審査準備

## UI/UXデザイン方針

### Senior側
- **超シンプル**: 画面に1つの大きなボタン「元気です」
- **大きな文字**: 最小フォントサイズ 20pt
- **高コントラスト**: 暗い背景 + 明るいテキスト or その逆
- **操作不要**: インストール後、基本的に触る必要なし
- **カラー**: 温かみのあるグリーン系（安心感）

### Watcher側
- **一目で状態把握**: ステータスカードに色でインジケート
  - 緑: チェックイン済み / 活動あり
  - 黄: 注意（チェックイン遅延 / 歩数少なめ）
  - 赤: アラート（未応答 / 異常検知）
- **情報過多にしない**: 必要な情報のみ表示
- **穏やかなトーン**: 不安を煽らないUI文言

### カラーパレット
```
Primary:    #4CAF50 (穏やかなグリーン)
Secondary:  #FF9800 (注意オレンジ)
Alert:      #F44336 (アラートレッド)
Background: #FAFAFA (ライトグレー)
Surface:    #FFFFFF
Text:       #212121
TextLight:  #757575
```

## セキュリティ / プライバシー

1. **収集データの最小化**: 歩数と大まかな位置変化のみ。GPS座標は保存しない
2. **RLS (Row Level Security)**: 家族メンバーのみがデータにアクセス可能
3. **データ保持期間**: 90日で自動削除（health_signals）
4. **明示的同意**: Senior側セットアップ時に「家族に見守ってもらう」を自分で選択
5. **プライバシーポリシー**: GitHub Pages でホスト
