import { setSelectedAlert } from "@/services/selectedAlert";
import { WildlifeAlert } from "@/types/wildlife";
import { QueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

export type WarningNotificationData = {
  type?: string;
  warningId?: string | number;
  warning_id?: string | number;
  feedbackId?: string | number;
  feedback_id?: string | number;
  replyCount?: string | number;
  feedback_count?: string | number;
  title?: string;
  body?: string;
  message?: string;
  pusherEventName?: string;
  [key: string]: unknown;
};

const warningListQueryKeys = new Set(["alerts", "my-alerts"]);

export const toWarningNotificationData = (
  data: unknown,
): WarningNotificationData => {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return toWarningNotificationData(parsed);
    } catch {
      return { message: data };
    }
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as WarningNotificationData;
  }

  return {};
};

export const getWarningNotificationId = (data: WarningNotificationData) =>
  data.warningId ?? data.warning_id;

const getReplyCount = (data: WarningNotificationData) => {
  const rawCount = data.replyCount ?? data.feedback_count;
  const count = Number(rawCount);
  return Number.isFinite(count) ? count : null;
};

export const isWarningFeedbackNotification = (
  data: WarningNotificationData,
) => {
  return (
    data.type === "warning.feedback.created" ||
    data.pusherEventName === "warning.feedback.created" ||
    data.pusherEventName === "new-feedback"
  );
};

const updateAlertReplyCount = (
  alert: WildlifeAlert,
  warningId: string,
  replyCount: number,
) => {
  if (String(alert.id) !== warningId) return alert;

  return {
    ...alert,
    replyNumber: replyCount,
    rawSubmission: alert.rawSubmission
      ? {
          ...alert.rawSubmission,
          feedback_count: replyCount,
        }
      : alert.rawSubmission,
  };
};

export const applyWarningNotificationToCache = (
  queryClient: QueryClient,
  data: WarningNotificationData,
) => {
  const warningId = getWarningNotificationId(data);
  const replyCount = getReplyCount(data);

  if (!warningId || replyCount == null) return;

  queryClient.setQueriesData<WildlifeAlert[]>(
    {
      predicate: (query) => {
        const [queryName] = query.queryKey;
        return (
          typeof queryName === "string" && warningListQueryKeys.has(queryName)
        );
      },
    },
    (oldAlerts) => {
      if (!oldAlerts) return oldAlerts;

      return oldAlerts.map((alert) =>
        updateAlertReplyCount(alert, String(warningId), replyCount),
      );
    },
  );

  queryClient.invalidateQueries({
    queryKey: ["alert-feedbacks", Number(warningId)],
  });
};

export const findCachedWarningAlert = (
  queryClient: QueryClient,
  warningId: string | number,
) => {
  const queries = queryClient.getQueryCache().getAll();

  for (const query of queries) {
    const [queryName] = query.queryKey;
    if (typeof queryName !== "string" || !warningListQueryKeys.has(queryName)) {
      continue;
    }

    const alerts = query.state.data;
    if (!Array.isArray(alerts)) continue;

    const alert = alerts.find(
      (item): item is WildlifeAlert =>
        Boolean(item) &&
        typeof item === "object" &&
        "id" in item &&
        String(item.id) === String(warningId),
    );

    if (alert) return alert;
  }

  return null;
};

export const openWarningFromNotification = (
  queryClient: QueryClient,
  data: WarningNotificationData,
) => {
  const warningId = getWarningNotificationId(data);
  if (!warningId) return false;

  const alert = findCachedWarningAlert(queryClient, warningId);
  if (alert) {
    setSelectedAlert(alert);
  }

  router.push({
    pathname: "/warning-feedbacks",
    params: { id: String(warningId), compose: "1" },
  });

  return true;
};
