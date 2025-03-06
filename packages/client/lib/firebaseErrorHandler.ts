import { i18n } from "@/lib/i18n";

export default function firebaseErrorHandler(errorCode: string) {
  switch (errorCode) {
    case "auth/email-already-exists":
      return i18n.t("email-already-exists");

    case "auth/user-not-found":
      return i18n.t("user-not-found");

    case "auth/wrong-password":
      return i18n.t("wrong-password");

    case "auth/network-request-failed":
      return i18n.t("network-request-failed");

    default:
      return errorCode;
  }
}
