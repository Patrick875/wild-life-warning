import { WildlifeAlert, WildlifeObservation } from "@/types/wildlife";
import axios, { isAxiosError } from "axios";
import { Platform } from "react-native";

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
    // throw new Error("Failed to fetch form structure");
    console.log("Failed to fetch form structure");
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
    // throw new Error("Failed to fetch form details");
    console.log("Failed to fetch form details");
  }

  const data = response.data;
  return data.content;
};

const localApiHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
// export const baseUrl = `http://${localApiHost}:4800/api/v1`;
export const baseUrl = "https://wild-life-conserv-2.onrender.com/api/v1";
export const alertsFormUid = "aFVTJLbCSxe3ixGxNoAMBU";
export const api = axios.create({
  baseURL: baseUrl,
});

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

const mapSubmissionToAlert = (
  submission: Record<string, any>,
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
  const title =
    `${count} ${pluralizeSpecies(String(species), String(count))} reported` ||
    "Wildlife reported";

  const severity =
    severityValue === "high" ||
    severityValue === "low" ||
    severityValue === "critical"
      ? severityValue
      : "medium";
  const parsedLocation = parseLocation(submissionData.location);

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
    submittedBy: submission?._submitted_by,
    severity,
    behavior: String(behavior),
    evidence,
    rawSubmission: submission,
    timestamp:
      submission._submission_time ||
      submission.submitted_at ||
      submission.created_at ||
      new Date().toISOString(),
  };
};

class WildlifeAPI {
  private baseUrl = baseUrl;

  // Simulate network delay
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAlerts(): Promise<WildlifeAlert[]> {
    const response = await api.get(`/forms/${alertsFormUid}/submissions`);

    const submissions = response.data?.data?.results?.results || [];

    if (!Array.isArray(submissions)) {
      console.log("Unexpected submissions response");
    }
    const sorted =
      submissions
        ?.map?.(mapSubmissionToAlert)
        ?.sort(
          (a: any, b: any) =>
            new Date(b?.timestamp).getTime() - new Date(a?.timestamp).getTime(),
        ) || [];

    return sorted;
  }

  async submitObservation(observation: any) {
    try {
      const response = await api.post(
        `/forms/${alertsFormUid}/submit_warning`,
        observation,
      );

      if (!response) {
        // throw new Error(`Failed to submit observation: ${response}`);
        console.log(`Failed to submit observation: ${response}`);
      }

      return response;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Error submitting observation:", {
          url: `${baseUrl}/forms/${alertsFormUid}/submit_warning`,
          status: error.response?.status,
          response: error.response?.data,
        });
      } else {
        console.error("Error submitting observation:", error);
      }
      // throw error;
      console.log(error);
    }
  }

  async getObservations(): Promise<WildlifeObservation[]> {
    await this.delay(500);

    // Mock data - in real app would fetch from server
    return [
      {
        id: "1",
        species: "Red Deer",
        location: "Highland Forest",
        timestamp: new Date().toISOString(),
        observer: "user123",
        count: 3,
        behavior: "Grazing",
        habitat: "Forest clearing",
        weather: "Sunny",
        notes: "Healthy looking herd, including one young deer",
      },
    ];
  }

  async authenticate(email: string, password: string) {
    await this.delay(1000);

    // Mock authentication - in real app would validate credentials
    if (email && password) {
      return {
        token: "mock_jwt_token",
        user: {
          id: "user123",
          email,
          name: "Wildlife Researcher",
          role: "researcher",
        },
      };
    }

    // throw new Error("Invalid credentials");
    console.log("Invalid credentials");
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; user: any }> {
    await this.delay(1000);

    // Mock registration
    return {
      success: true,
      user: {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: "researcher",
      },
    };
  }

  async resetPassword(email: string): Promise<{ success: boolean }> {
    await this.delay(1000);

    // Mock password reset
    console.log(`Password reset requested for: ${email}`);

    return { success: true };
  }
}

export const wildlifeApi = new WildlifeAPI();
