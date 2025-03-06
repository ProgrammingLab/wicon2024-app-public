/*eslint sort-keys: ["error", "asc", {"caseSensitive": false, "natural": true}]*/
import { getLocales } from "expo-localization";
import { I18n, TranslateOptions } from "i18n-js";

const translations = {
  en: {
    account: "Account",
    accountSettings: "Account settings",
    add: "Add",
    "Add a car": "Add a car",
    "Add a field": "Add a field",
    AddCrop: "Add a Crop",
    AddDiary: "Add a Diary",
    AddDiaryPack: "Add a new diaryPack",
    AddFertilizer: "Add a Fertilizer",
    AddPesticide: "Add a Pesticide",
    appName: "Super App!! (Temporary)",
    "As Usual": "As Usual",
    authentication: "Authentication",
    bluetoothReceiverSettings: "Bluetooth receiver settings",
    cancel: "Cancel",
    CarForwardDistance: "Distance from front of vechicle to antenna",
    CarGroundDistance: "Distance of antenna from ground",
    CarLeftDistance: "Distance from left side of vechicle to antenna",
    cars: "Cars",
    carSettings: "Cars Settings",
    CarWidth: "The width of Car",
    close: "Close",
    cloudy: "cloudy",
    Colder: "Colder",
    "Compared to average": "Compared to average",
    confirmPassword: "Confirm password",
    connected: "Connected",
    "Connectivity Check": "Connectivity Check",
    country: "Country",
    create: "Create",
    createGroup: "Create a Group",
    crops: "Crops",
    cropSettings: "Crops settings",
    dateOfPesticideApplication: "Date of pesticide application",
    day: "day",
    delete: "Delete",
    deleteAccount: "Delete Account",
    diaries: "Diaries",
    diariesDetails: "Diaries details",

    diariesSettings: "Diaries settings",
    diariesType: "Diaries type",
    diaryPack: "diaryPack",
    diaryPackSetting: "diaryPack setting",
    disconnected: "Disconnected",
    "email-already-exists": "Email already exists",
    emailAddress: "Email address",
    emailAddressC: "Confirm email address.",
    emailRequired: "Email is required",
    emailWasSent:
      "Email sent. Click the link in the email. After that, please sign in. And press the button below.",
    error: "Error",
    export: "Export",
    exportDiaries: "Export diaries",
    failedToConnectToServer: "Failed to connect to server",
    fertilizers: "Fertilizers",
    FertilizerSettings: "Fertilizer settings",
    fieldArea: "Field area",
    fields: "Fields",
    finish: "Finish",
    futureSchedule: "Future schedule",
    "Group name is required": "Group name is required",
    groupName: "Group name",
    groupSettings: "Group settings",
    groupSettingsD: "This is the group setting.",
    harvestDate: "Harvest date",
    height: "Height",
    home: "Home",
    hostNameIsRequired: "Host name is required",
    Hotter: "Hotter",
    hour: "hour",
    idInput: "Input the user ID",
    important: "Important",
    inputDefaultSettingsToReceiver: "input default settings to receiver",
    invalidEmail: "Invalid email",
    invite: "Invite members",
    inviteButton: "Invite",
    length: "Length",
    list: "list",
    listOfCrops: "List of crops",
    listOfDiaries: "List of diaries",
    listOfFields: "List of fields",
    "Long Range Forecast": "Long Range Forecast",
    max: "Max",
    memo: "Memo",
    min: "Min",
    mountPoint: "Mount point",

    name: "Name",
    nameRequired: "Name is required",
    nav: "Nav",
    // 翻訳怪しい
    navigation: "Navigation",
    Ndisinfections: "Number of disinfections",
    NDSdisinfection: "Number of days since disinfection",
    NDSsowing: "Number of days since sowing",
    "network-request-failed": "Network request failed. Please try again.",
    next: "Next",
    ntripSettings: "NTRIP Settings",
    onTrack: "On track",
    overview: "'s Overview",
    password: "Password",
    passwordIsNotMatch: "Password is not match",
    passwordRequired: "Password is required",
    passwordTooShort: "Password needs to be at least 6 characters",
    pesticides: "Pesticides",
    pesticidesNumber: "Number of pesticides",
    pesticidesSettings: "Pesticides settings",
    pleaseRestart: "Please restart the app",
    pleaseVerifyEmail: "Please verify your email address",
    port: "Port",
    portIn: "Input your port number",
    rainy: "rainy",
    receiverSelection: "receiver selection",
    receiverSettings: "receiver settings",
    record: "Record",
    recordDiary: "Work record to date",
    recordToday: "Today's journal entry",
    reset: "Reset",
    resetPassword: "Reset password",
    return: "Back",
    save: "Save",
    schedule: "Schedule",
    scheduleORrecord: "Choose to create a plan or record",
    selectACar: "Select a car",
    selectAField: "Select a field",
    selectARoad: "Select a road",
    selectPlease: "select...",
    sendMeAnVerificationEmail: "Send me an verification email",
    server: "Server",
    serverIn: "Input your server",
    settings: "Settings",
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    snowy: "snowy",
    sowingDate: "Sowing date",
    submit: "submit",
    sunny: "sunny",
    "The weather won't change for a while":
      "The weather won't change for a while",
    "Updated at": "Updated at",
    usbReceiverSettings: "USB receiver settings",
    "user-not-found": "User not found",
    username: "Username",
    usernameIn: "Input your username",
    verifyEmail: "Verify Email",
    warmOrCool: "warmer or coolder than usual?",
    weatherLast: "Temperature on harvest day",
    weathers: "Weathers",
    welcome: "Hello",
    workContent: "Work content",
    worker: "Worker",
    workingContent: "Working content",
    workingDate: "Working date",
    "wrong-password": "Wrong password",

    youAlreadyHaveAnAccount: "You already have an account?",
    youDontHaveAnAccount: "You don't have an account?",
  },
  ja: {
    account: "アカウント",
    accountSettings: "アカウント設定",
    add: "追加",
    "Add a car": "車両を追加する",
    "Add a field": "圃場を追加する",
    AddCrop: "作物を追加",
    AddDiary: "日誌を追加",
    AddDiaryPack: "日誌アーカイブを新しく作成",
    AddFertilizer: "肥料を追加",
    AddPesticide: "農薬を追加",
    appName: "スーパーアプリ！！（仮）",
    "As Usual": "平年通り",
    authentication: "認証を有効にする",
    bluetoothReceiverSettings: "Bluetooth受信機設定",
    cancel: "キャンセル",
    CarForwardDistance: "車体前方からアンテナの距離",
    CarGroundDistance: "地面からアンテナの距離",
    CarLeftDistance: "車体左側からアンテナの距離",
    cars: "車両",
    carSettings: "車両設定",
    CarWidth: "横幅",
    close: "閉じる",
    cloudy: "曇り",
    Colder: "寒い",
    "Compared to average": "平年と比べて",
    confirmPassword: "パスワードの確認",
    connected: "接続しました",
    "Connectivity Check": "接続チェック",
    country: "国",
    create: "作成",
    createGroup: "グループを作成",
    crops: "作目",
    cropSettings: "作目設定",
    dateOfPesticideApplication: "消毒日",
    day: "日",
    delete: "削除",
    deleteAccount: "アカウントを削除",
    diaries: "日誌",
    diariesDetails: "日誌の詳細",
    diariesSettings: "日誌の設定",
    diariesType: "日誌の種類",
    diaryPack: "日誌アーカイブ",
    diaryPackSetting: "日誌アーカイブの設定",
    disconnected: "接続が切断されました",
    "email-already-exists": "そのメールアドレスは既に使われています",
    emailAddress: "メールアドレス",
    emailAddressC: "メールアドレスの確認を行う",
    emailRequired: "メールアドレスを入力してください",
    emailWasSent:
      "メールを送信しました。メール内のリンクをクリックしてください。その後、下のボタンを押してください。",
    error: "エラー",
    export: "出力する",
    exportDiaries: "日誌を出力する",
    failedToConnectToServer: "サーバーに接続できませんでした",
    fertilizers: "肥料",
    FertilizerSettings: "肥料の設定",
    fieldArea: "圃場面積",
    fields: "圃場",
    finish: "終わる",
    futureSchedule: "今後の予定",
    "Group name is required": "グループ名は必須です",
    groupName: "グループ名",
    groupSettings: "グループ設定",
    groupSettingsD: "グループの設定を行う",
    harvestDate: "収穫日",
    height: "高さ",
    home: "ホーム",
    hostNameIsRequired: "ホスト名は必須です",
    Hotter: "暑い",
    hour: "時間",
    idInput: "ユーザーIDを入力してください",
    important: "重要",
    inputDefaultSettingsToReceiver: "デフォルト設定を受信機に投入",
    invalidEmail: "無効なメールアドレスです",
    invite: "メンバー招待",
    inviteButton: "招待",
    length: "長さ",
    list: "一覧",
    listOfCrops: "作物一覧",
    listOfDiaries: "日誌一覧",
    listOfFields: "圃場一覧",
    "Long Range Forecast": "長期予報",
    max: "最高",
    memo: "メモ",
    min: "最低",
    mountPoint: "マウントポイント",
    name: "名前",
    nameRequired: "名前は必須です",
    nav: "ナビ",
    navigation: "ナビゲーション",
    Ndisinfections: "消毒回数",
    NDSdisinfection: "消毒日からの経過日数",
    NDSsowing: "播種日からの経過日数",
    "network-request-failed":
      "ネットワークリクエストに失敗しました。もう一度お試しください。",
    next: "次へ",
    ntripSettings: "NTRIP設定",
    onTrack: "順調です",
    overview: "の概要",
    password: "パスワード",
    passwordIsNotMatch: "パスワードが一致しません",
    passwordRequired: "パスワードを入力してください",
    passwordTooShort: "パスワードは6文字以上で入力してください",
    pesticides: "農薬",
    pesticidesNumber: "農薬番号",
    pesticidesSettings: "農薬の設定",
    pleaseRestart: "アプリを再起動してください",
    pleaseVerifyEmail: "メールアドレスを確認してください",
    port: "ポート",
    portIn: "ポート番号を入力してください",
    rainy: "雨",
    receiverSelection: "受信機選択",
    receiverSettings: "受信機設定",
    record: "記録",
    recordDiary: "今日までの作業記録",
    recordToday: "今日登録された日誌",
    reset: "リセット",
    resetPassword: "パスワードを再設定",
    return: "戻る",
    save: "保存",
    schedule: "予定",
    scheduleORrecord: "予定か記録かを選んで作成",
    selectACar: "車両を選択してください",
    selectAField: "圃場を選択してください",
    selectARoad: "道を選択してください",
    selectPlease: "選択...",
    sendMeAnVerificationEmail: "確認メールを送る",
    server: "サーバ",
    serverIn: "サーバを入力してください",
    settings: "設定",
    signIn: "サインイン",
    signOut: "サインアウト",
    signUp: "サインアップ",
    snowy: "雪",
    sowingDate: "播種日",
    submit: "投入",
    sunny: "晴れ",
    "The weather won't change for a while": "しばらく天気は変わらないでしょう",
    "Updated at": "最終更新日",
    usbReceiverSettings: "USB受信機設定",
    "user-not-found": "ユーザーが見つかりません",
    username: "ユーザー名",
    usernameIn: "ユーザー名を入力してください",
    verifyEmail: "メールアドレスの確認",
    warmOrCool: "平年より暖かいか寒いか",
    weatherLast: "収穫日の天気",
    weathers: "天気",
    welcome: "こんにちは",
    workContent: "作業内容",
    worker: "作業者",
    workingContent: "作業内容",
    workingDate: "作業日",
    "wrong-password": "パスワードが間違っています",
    youAlreadyHaveAnAccount: "アカウントを持っていますか？",
    youDontHaveAnAccount: "アカウントを持っていませんか？",
  },
  vi: {
    account: "Tài khoản",
    accountSettings: "Tài khoản Cài đặt",
    add: "Thêm vào",
    "Add a car": "Thêm vào: Phương tiện giao thông",
    "Add a field": "Thêm vào: Cánh đồng",
    AddCrop: "Thêm vào: Hoa màu",
    AddDiary: "Thêm vào: Nhật ký",
    AddDiaryPack: "Add a new diaryPack", //未対応
    AddFertilizer: "Add a Fertilizer", //未対応
    AddPesticide: "Add a Pesticide", //未対応
    appName: "スーパーアプリ！！（仮）",
    "As Usual": "Như mọi năm",
    authentication: "Authentication", //未対応
    bluetoothReceiverSettings: "Bluetooth receiver settings", //未対応
    cancel: "Cancel", //未対応
    CarForwardDistance: "Khoảng cách ăng-ten từ phía trước xe",
    CarGroundDistance: "Khoảng cách ăng-ten từ mặt đất",
    CarLeftDistance: "Khoảng cách ăng-ten từ bên trái xe",
    cars: "Phương tiện giao thông",
    carSettings: "Cài đặt: Phương tiện giao thông",
    CarWidth: "Chiều ngang",
    close: "Đóng lại",
    cloudy: "Mây",
    Colder: "Lạnh",
    "Compared to average": "So với thường năm",
    confirmPassword: "Xác nhận: Mật khẩu",
    connected: "Kết nối",
    "Connectivity Check": "Connectivity Check", //未対応
    country: "Quốc gia",
    create: "Tạo mới",
    createGroup: "Create a Group", //未対応
    crops: "Chủng loại, loại giống",
    cropSettings: "Crops settings", //未対応
    dateOfPesticideApplication: "Ngày phun thuốc",
    day: "Ngày",
    delete: "Xóa bỏ",
    deleteAccount: "Xóa bỏ: Tài khoản",
    diaries: "Nhật ký",
    diariesDetails: "Chi tiết: Nhật ký",
    diariesSettings: "Cài đặt: Nhật ký",
    diariesType: "Loại: Nhật ký",
    diaryPack: "diaryPack", //未対応
    diaryPackSetting: "diaryPack setting", //未対応
    disconnected: "Bị ngắt kết nối",
    "email-already-exists": "Email already exists", //未対応
    emailAddress: "Email address", //未対応
    emailAddressC: "Confirm email address.", //未対応
    emailRequired: "Email is required", //未対応
    emailWasSent:
      "Email sent. Click the link in the email. After that, please sign in. And press the button below.", //未対応
    error: "Error", //未対応
    export: "Export", //未対応
    exportDiaries: "Export diaries", //未対応
    failedToConnectToServer: "Failed to connect to server", //未対応
    fertilizers: "Fertilizers", //未対応
    FertilizerSettings: "Fertilizer settings", //未対応
    fieldArea: "Field area", //未対応
    fields: "Cánh đồng",
    finish: "finish", //未対応
    futureSchedule: "Future schedule", //未対応
    "Group name is required": "Bắt buộc: Tên nhóm",
    groupName: "Tên nhóm",
    groupSettings: "Group settings", //未対応
    groupSettingsD: "This is the group setting.", //未対応
    harvestDate: "Ngày thu hoạch",
    height: "Chiều dọc",
    home: "Home", //未対応
    hostNameIsRequired: "Host name is required", //未対応
    Hotter: "Nóng",
    hour: "Thời gian",
    idInput: "Input the user ID", //未対応
    important: "Quan trọng",
    inputDefaultSettingsToReceiver: "input default settings to receiver", //未対応
    invalidEmail: "Invalid email", //未対応
    invite: "Mời thành viên",
    inviteButton: "Mời",
    length: "Độ dài",
    list: "Danh sách",
    listOfCrops: "Danh sách(Hoa màu)",
    listOfDiaries: "Danh sách(Nhật ký)",
    listOfFields: "Danh sách(Cánh đồng)",
    "Long Range Forecast": "Dự báo thời tiết dài hạn",
    max: "Max", //未対応
    memo: "Memo", //未対応
    min: "Min", //未対応
    mountPoint: "Mount point", //未対応
    name: "Tên",
    nameRequired: "Bắt buộc:Tên",
    nav: "Nav", //未対応
    navigation: "Navigation", //未対応
    Ndisinfections: "Số lần phun thuốc",
    NDSdisinfection: "Số ngày trôi qua(Ngày phun thuốc)",
    NDSsowing: "Số ngày trôi qua(Ngày gieo hạt)",
    "network-request-failed": "Network request failed. Please try again.", //未対応
    next: "Tiếp theo",
    ntripSettings: "Cài đặt: NTRIP",
    onTrack: "On track",
    overview: "Sơ lược",
    password: "mật khẩu",
    passwordIsNotMatch: "Sai mật khẩu",
    passwordRequired: "Nhập liệu: mật khẩu",
    passwordTooShort: "Password needs to be at least 6 characters", //未対応
    pesticides: "Pesticides", //未対応
    pesticidesNumber: "Number of pesticides", //未対応
    pesticidesSettings: "Pesticides settings", //未対応
    pleaseRestart: "Hãy khởi động lại ứng dụng",
    pleaseVerifyEmail: "Please verify your email address", //未対応
    port: "Port", //未対応
    portIn: "Input your port number", //未対応
    rainy: "Mưa",
    receiverSelection: "Lựa chọn máy nhận tín hiệu",
    receiverSettings: "receiver settings", //未対応
    record: "Ghi chép lại",
    recordDiary: "Work record to date", //未対応
    recordToday: "Today's journal entry", //未対応
    reset: "Reset", //未対応
    resetPassword: "Cài đặt lại mật khẩu",
    return: "Quay lại",
    save: "Lưu",
    schedule: "Dự định",
    scheduleORrecord: "Choose to create a plan or record", //未対応
    selectACar: "Chọn: Phương tiện giao thông",
    selectAField: "Chọn: Cánh đồng",
    selectARoad: "Chọn: Con đường",
    selectPlease: "Chọn",
    sendMeAnVerificationEmail: "Send me an verification email", //未対応
    server: "Server", //未対応
    serverIn: "Input your server", //未対応
    settings: "Cài đặt",
    signIn: "Sign In", //未対応
    signOut: "Sign Out", //未対応
    signUp: "Sign Up", //未対応
    snowy: "Tuyết",
    sowingDate: "Ngày gieo hạt",
    submit: "submit", //未対応
    sunny: "Nắng",
    "The weather won't change for a while":
      "Thời tiết sẽ không thay đổi trong 1 thời gian",
    "Updated at": "Ngày cập nhật cuối cùng",
    usbReceiverSettings: "USB receiver settings", //未対応
    "user-not-found": "Không tìm thấy người dùng",
    username: "Username", //未対応
    usernameIn: "Input your username", //未対応
    verifyEmail: "Verify Email", //未対応
    warmOrCool: "So với thường năm(nóng/lạnh)",
    weatherLast: "Thời tiết của ngày thu hoạch lần trước",
    weathers: "Thời tiết",
    welcome: "Hello", //未対応
    workContent: "Work content", //未対応
    worker: "Worker", //未対応
    workingContent: "Nội dung công việc",
    workingDate: "Ngày thực hiện(thao tác)",
    "wrong-password": "Sai mật khẩu",
    youAlreadyHaveAnAccount: "You already have an account?", //未対応
    youDontHaveAnAccount: "You don't have an account?", //未対応
  },
} as const;

// 型チェック
type AllTranslationKeys<T> = {
  [L in keyof T]: keyof T[L];
}[keyof T];
type ValidateTranslations<T extends Record<string, Record<string, string>>> = {
  [L in keyof T]: { [K in AllTranslationKeys<T>]: string };
};
// ここにエラーが発生している場合、どこかの翻訳データが不足している。
const validTranslations: ValidateTranslations<typeof translations> =
  translations;

// i18n.t()の型を設定したキーのみにする。

export const i18n = new I18n(validTranslations) as Omit<I18n, "t"> & {
  t: <T = string>(
    scope: keyof (typeof translations)["en"],
    options?: TranslateOptions,
  ) => string | T;
};

i18n.locale = getLocales()[0]?.languageCode || "en";
// i18n.locale = "en";

export default i18n;
