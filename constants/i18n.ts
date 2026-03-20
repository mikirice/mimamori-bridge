type Locale = "ja" | "en";

const translations = {
  ja: {
    // Common
    appName: "MimamoriBridge",
    tagline: "離れていても、穏やかに見守る",
    cancel: "キャンセル",
    ok: "OK",
    error: "エラー",
    loading: "読み込み中...",

    // Auth
    login: "ログイン",
    register: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    displayName: "お名前",
    loginError: "ログインエラー",
    registerError: "登録エラー",
    noAccount: "アカウントをお持ちでない方は",
    hasAccount: "既にアカウントをお持ちの方は",
    createAccount: "アカウント作成",
    fillAllFields: "すべての項目を入力してください",
    passwordTooShort: "パスワードは6文字以上で入力してください",
    accountCreated: "アカウントが作成されました",

    // Roles
    watcher: "見守る側",
    senior: "見守られる側",
    watcherDesc: "お子さん・ご家族",
    seniorDesc: "お父さん・お母さん",
    selectRole: "あなたの役割を選んでください",

    // Family
    connectFamily: "家族とつながる",
    inviteCode: "招待コード",
    joinFamily: "家族に参加",
    createFamily: "新しい家族グループを作成",
    shareInviteCode: "招待コードを共有",
    members: "メンバー",
    inviteCodeNotFound: "招待コードが見つかりません",
    alreadyInFamily: "既にこの家族に参加しています",
    or: "または",

    // Senior
    goodMorning: "おはようございます",
    goodAfternoon: "こんにちは",
    goodEvening: "こんばんは",
    imFine: "元気です",
    sent: "送信済み",
    checkInComplete: "今日の安否確認は完了しています",
    tapToCheckIn: "ボタンをタップして\n家族に元気を伝えましょう",
    sentMessage: "送信しました",
    sentDetail: "ご家族に「元気です」を伝えました",
    sendFailed: "送信に失敗しました。もう一度お試しください。",

    // Watcher
    noSeniors: "見守り対象の方がまだいません。\n家族タブから招待コードを共有してください。",
    lastCheck: "最終確認",
    todaySteps: "今日の歩数",
    steps: "歩",
    askIfFine: "元気？",
    nudgeConfirm: "さんに「元気？」を送りますか？",
    nudgeSent: "さんに通知を送りました",
    nudgeSentTitle: "送信完了",
    safetyCheck: "安否確認",

    // Status
    statusOk: "元気",
    statusWarning: "注意",
    statusAlert: "要確認",
    statusUnknown: "未確認",

    // Alerts
    noCheckinAlert: "今朝のチェックインがありません",
    lowStepsAlert: "今日の歩数が少ないようです",
    noActivityAlert: "しばらく活動が検知されていません",
    needsCheck: "確認が必要です",

    // Timeline
    todayActivity: "今日のアクティビティ",
    noActivity: "まだアクティビティがありません",
    checkInDone: "チェックイン完了",
    stepsUpdate: "歩数更新",
    departed: "外出を検知",
    returned: "帰宅を検知",

    // History
    checkinHistory: "チェックイン履歴（直近7日）",
    vsYesterday: "昨日比",

    // Settings
    account: "アカウント",
    notificationSettings: "通知設定",
    about: "アプリについて",
    logout: "ログアウト",
    logoutConfirm: "ログアウトしますか？",
    privacy: "プライバシー",
    privacyDesc: "このアプリはGPS追跡を行いません。\n共有されるのは歩数と安否確認の情報のみです。",
    checkinNotification: "チェックイン通知",
    checkinNotificationDesc: "毎朝 7:00 に「元気ですか？」通知が届きます。\nボタンをタップするだけで家族に安心を届けられます。",
  },
  en: {
    appName: "MimamoriBridge",
    tagline: "Gentle care, even from afar",
    cancel: "Cancel",
    ok: "OK",
    error: "Error",
    loading: "Loading...",

    login: "Log In",
    register: "Sign Up",
    email: "Email",
    password: "Password",
    displayName: "Display Name",
    loginError: "Login Error",
    registerError: "Registration Error",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create Account",
    fillAllFields: "Please fill in all fields",
    passwordTooShort: "Password must be at least 6 characters",
    accountCreated: "Account created successfully",

    watcher: "Watcher",
    senior: "Senior",
    watcherDesc: "Son, Daughter, Family",
    seniorDesc: "Father, Mother",
    selectRole: "Choose your role",

    connectFamily: "Connect with Family",
    inviteCode: "Invite Code",
    joinFamily: "Join Family",
    createFamily: "Create New Family Group",
    shareInviteCode: "Share Invite Code",
    members: "Members",
    inviteCodeNotFound: "Invite code not found",
    alreadyInFamily: "You're already in this family",
    or: "or",

    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    imFine: "I'm fine",
    sent: "Sent",
    checkInComplete: "Today's check-in is complete",
    tapToCheckIn: "Tap the button to\nlet your family know you're OK",
    sentMessage: "Sent!",
    sentDetail: "Your family knows you're doing well",
    sendFailed: "Failed to send. Please try again.",

    noSeniors: "No one to watch over yet.\nShare your invite code from the Family tab.",
    lastCheck: "Last check",
    todaySteps: "Today's steps",
    steps: "steps",
    askIfFine: "Check in?",
    nudgeConfirm: "Send a check-in to ",
    nudgeSent: "Notification sent to ",
    nudgeSentTitle: "Sent",
    safetyCheck: "Safety Check",

    statusOk: "OK",
    statusWarning: "Caution",
    statusAlert: "Check needed",
    statusUnknown: "Unknown",

    noCheckinAlert: "No check-in this morning",
    lowStepsAlert: "Step count is low today",
    noActivityAlert: "No activity detected for a while",
    needsCheck: "Needs attention",

    todayActivity: "Today's Activity",
    noActivity: "No activity yet",
    checkInDone: "Check-in complete",
    stepsUpdate: "Steps updated",
    departed: "Left home",
    returned: "Returned home",

    checkinHistory: "Check-in History (7 days)",
    vsYesterday: "vs yesterday",

    account: "Account",
    notificationSettings: "Notification Settings",
    about: "About",
    logout: "Log Out",
    logoutConfirm: "Are you sure you want to log out?",
    privacy: "Privacy",
    privacyDesc: "This app does not use GPS tracking.\nOnly step count and check-in data are shared.",
    checkinNotification: "Check-in Notifications",
    checkinNotificationDesc: "You'll receive a daily notification at 7:00 AM.\nJust tap to let your family know you're OK.",
  },
} as const;

let currentLocale: Locale = "ja";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: keyof (typeof translations)["ja"]): string {
  return translations[currentLocale][key] || translations.ja[key] || key;
}

export { translations, type Locale };
