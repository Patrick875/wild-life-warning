import {
  ApiEnvelope,
  PaginatedWarningSubmissions,
  WarningFeedback,
  WarningSeverity,
  WarningSubmission,
  WildlifeAlert,
} from "@/types/wildlife";
import axios from "axios";
import { apiClient, baseUrl } from "./axiosInstance";

export { baseUrl };

const BASE_URL = "https://kc.kobotoolbox.org/api/v2/assets";
const TOKEN = "c6a41ab079fb6b99fc8b69f9f4bc6eb91f1ca0a1";

const parseKoboTextValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");
  if (typeof value === "object" && value !== null) {
    const firstValue = Object.values(value)[0];
    return parseKoboTextValue(firstValue);
  }
  return "";
};

export const fetchKoboFormStructure = async (formUid: string) => {
  const response = await axios.get(`${BASE_URL}/${formUid}/`, {
    headers: {
      Authorization: `Token ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.data) {
    throw new Error("Failed to fetch form structure");
  }

  const data = response.data;
  const survey = data.content.survey || [];
  const choices = data.content.choices || [];

  const choiceMap: Record<string, { name: string; label: string }[]> = {};
  choices.forEach((choice: any) => {
    const listName = choice.list_name || choice["list_name"];
    const name = choice.name || choice["name"];
    const label =
      parseKoboTextValue(choice.label || choice["label"]) || String(name || "");
    if (!listName || !name) return;
    if (!choiceMap[listName]) {
      choiceMap[listName] = [];
    }
    choiceMap[listName].push({ name, label });
  });

  return survey.map((field: any) => ({
    ...field,
    label: parseKoboTextValue(field.label || field["label"]),
    hint: parseKoboTextValue(field.hint || field["hint"]),
    selectChoices:
      field.selectChoices ||
      (field.select_from_list_name && choiceMap[field.select_from_list_name]) ||
      field.selectChoices,
  }));
};
export const fetchFormDetails = async (formUid: string) => {
  const response = await axios.get(`${BASE_URL}/${formUid}/`, {
    headers: {
      Authorization: `Token ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.data) {
    throw new Error("Failed to fetch form details");
  }

  const data = response.data;
  return data.content;
};

export const alertsFormUid = "aFVTJLbCSxe3ixGxNoAMBU";

const getSubmissionValue = (
  submissionData: Record<string, any>,
  fieldNames: string[],
) => {
  const entry = Object.entries(submissionData).find(([key]) => {
    const normalizedKey = key.toLowerCase();
    return fieldNames.some(
      (fieldName) =>
        normalizedKey === fieldName.toLowerCase() ||
        normalizedKey.endsWith(`/${fieldName.toLowerCase()}`),
    );
  });
  return entry?.[1];
};

const parseLocation = (value: unknown) => {
  if (typeof value === "string") {
    const parts = value.split(/[,\s]+/).filter(Boolean);
    return {
      lat: Number(parts[0]),
      lng: Number(parts[1]),
    };
  }

  if (typeof value === "object" && value !== null) {
    const location = value as Record<string, unknown>;
    if (location.latitude != null && location.longitude != null) {
      return {
        lat: Number(location.latitude),
        lng: Number(location.longitude),
      };
    }
  }

  return { lat: undefined, lng: undefined };
};

const pluralizeSpecies = (species: string, count: string) => {
  const numericCount = Number(count);
  if (!Number.isFinite(numericCount) || numericCount === 1) return species;
  if (species.toLowerCase().endsWith("s")) return species;
  return `${species}s`;
};

const toIsoTimestamp = (value: unknown) => {
  const date =
    typeof value === "number" || typeof value === "string"
      ? new Date(value)
      : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
};

const normalizeEvidence = (value: unknown) => {
  const parsedValue =
    typeof value === "string" && value.trim().length > 0
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        })()
      : value;

  if (!Array.isArray(parsedValue)) return [];

  return parsedValue.map((item) => {
    if (typeof item !== "object" || item === null) return {};
    const media = item as Record<string, any>;
    return {
      uri: media.uri || media["evidence/uri"],
      url: media.url || media["evidence/url"],
      name: media.name || media["evidence/name"],
      mimeType: media.mimeType || media["evidence/mimeType"],
      size: media.size || media["evidence/size"],
      type: media.type || media["evidence/type"],
      timestamp: media.timestamp || media["evidence/timestamp"],
    };
  });
};

export const normalizeFeedbacks = (value: unknown): WarningFeedback[] => {
  if (!Array.isArray(value)) return [];

  return value
    .reduce<WarningFeedback[]>((feedbackList, item) => {
      if (typeof item !== "object" || item === null) return feedbackList;
      const feedback = item as Record<string, any>;
      const message = feedback.message || feedback.feedback || feedback.text;
      if (!message) return feedbackList;

      feedbackList.push({
        id: feedback.id || feedback._id || feedback.uuid,
        message: String(message),
        warning_id: feedback.warning_id || feedback.warningId,
        submitted_by:
          feedback.submitted_by ||
          feedback.submittedBy ||
          feedback.username ||
          feedback?.user?.full_name,
        created_at: feedback.created_at || feedback.createdAt,
        updated_at: feedback.updated_at || feedback.updatedAt,
        user_id: feedback.user_id || feedback.userId,
        user: feedback?.user,
        timestamp:
          feedback.timestamp ||
          feedback.created_at ||
          feedback.createdAt ||
          new Date().toISOString(),
      });

      return feedbackList;
    }, [])
    .sort(
      (a, b) =>
        new Date(b.timestamp || b.created_at || 0).getTime() -
        new Date(a.timestamp || a.created_at || 0).getTime(),
    );
};

export const mapSubmissionToAlert = (
  submission: WarningSubmission,
  index: number,
): WildlifeAlert => {
  const nestedSubmissionData =
    typeof submission.submission_data === "object" &&
    submission.submission_data !== null
      ? submission.submission_data
      : {};
  const submissionData = { ...nestedSubmissionData, ...submission };
  const species =
    getSubmissionValue(submissionData, [
      "species",
      "animal",
      "What_animal_have_you_red_or_seen_signs_of",
    ]) || "Wild animals";
  const count =
    getSubmissionValue(submissionData, [
      "number_of_animals",
      "How_many_did_encounter",
    ]) || "1";
  const behavior =
    getSubmissionValue(submissionData, [
      "behaviour",
      "behavior",
      "bahaviour",
      "How_where_the_animal_behaving",
    ]) || "";
  const description =
    getSubmissionValue(submissionData, [
      "observation",
      "description",
      "Field_Observations",
    ]) || "A wildlife sighting has been submitted.";
  const severityValue = String(
    getSubmissionValue(submissionData, [
      "threat_level",
      "Urgency_Level",
      "threat_Level",
    ]) || "",
  ).toLowerCase();
  const evidence = normalizeEvidence(
    getSubmissionValue(submissionData, [
      "evidence",
      "eveidence",
      "Evidence_Media",
    ]),
  );
  const feedbacks = normalizeFeedbacks(
    submission.feedbacks || submission.warning_feedbacks || submission.replies,
  );
  const title =
    `${count} ${pluralizeSpecies(String(species), String(count))} reported` ||
    "Wildlife reported";

  const severity: WarningSeverity =
    severityValue === "high" ||
    severityValue === "low" ||
    severityValue === "critical"
      ? severityValue
      : "medium";
  const parsedLocation = parseLocation(submissionData.location);
  const timestamp =
    submission._submission_time ||
    submission.submitted_at ||
    submission.created_at ||
    new Date().toISOString();

  return {
    id: String(
      submission.id ||
        submission.uuid ||
        submission._id ||
        submission.submitted_at ||
        `submission-${index}`,
    ),
    title: title,
    species: String(species),
    count: String(count),
    description: String(description),
    location: parsedLocation,
    submittedBy: submission._submitted_by || submission.user?.full_name,
    severity,
    behavior: String(behavior),
    evidence,
    feedbacks,
    replyNumber: submission.feedback_count || feedbacks.length,
    rawSubmission: submission,
    created_at: submission.created_at || Date.now(),
    updated_at: submission.updated_at,
    user_id: submission.user_id,
    status: submission.status,
    kobo_submission_id: submission.kobo_submission_id,
    timestamp: toIsoTimestamp(timestamp),
  };
};

const getAlertTime = (alert: WildlifeAlert) => {
  const value = alert.created_at || alert.timestamp;
  const time = typeof value === "number" ? value : new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const fetchAlertSubmissions = async (formId = alertsFormUid) => {
  const response = await apiClient.get<
    ApiEnvelope<PaginatedWarningSubmissions>
  >(`/forms/${formId}/submissions`);

  return response.data.data;
};

export const fetchMyAlertSubmissions = async (formId = alertsFormUid) => {
  const response = await apiClient.get<
    ApiEnvelope<PaginatedWarningSubmissions>
  >(`/forms/${formId}/submissions/me`);

  return response.data.data;
};

export const fetchAlerts = async (formId = alertsFormUid) => {
  const submissions = await fetchAlertSubmissions(formId);

  if (!Array.isArray(submissions.api_results)) {
    throw new Error("Unexpected submissions response");
  }

  return submissions.api_results
    .map(mapSubmissionToAlert)
    .sort((a, b) => getAlertTime(b) - getAlertTime(a));
};

export const fetchMyAlerts = async (formId = alertsFormUid) => {
  const submissions = await fetchMyAlertSubmissions(formId);

  if (!Array.isArray(submissions.api_results)) {
    throw new Error("Unexpected my submissions response");
  }

  return submissions.api_results
    .map(mapSubmissionToAlert)
    .sort((a, b) => getAlertTime(b) - getAlertTime(a));
};

export const submitObservation = async ({
  formId = alertsFormUid,
  observation,
}: {
  formId?: string;
  observation: unknown;
}) => {
  const response = await apiClient.post(
    `/forms/${formId}/submit_warning`,
    observation,
  );

  return response.data;
};
