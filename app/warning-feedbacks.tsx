import { useGetFeedbacks, useSubmitFeedback } from "@/services/alert";
import { getSelectedAlert } from "@/services/selectedAlert";
import { formatDistanceToNow } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CirclePlus,
  MessageSquare,
  Send,
  ShieldAlert,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function WarningFeedbacksScreen() {
  const alert = getSelectedAlert();
  const params = useLocalSearchParams<{ compose?: string }>();
  const [message, setMessage] = useState("");

  const [showComposer, setShowComposer] = useState(params.compose === "1");

  const { data: feedbacksData, refetch } = useGetFeedbacks({
    alertId: Number(alert?.id),
  });
  const { mutate, isPending: isSubmitting } = useSubmitFeedback();
  const submitFeedback = () => {
    mutate(
      {
        message: message,
        warning_id: alert?.id,
      },
      {
        onSuccess: (res) => {
          Toast.show({
            type: "success",
            text1: res?.message || "Feedback added successfully!",
          });
          setShowComposer(false);
          refetch();
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: err?.response?.data?.message || "Failed adding feedback",
          });
        },
      },
    );
  };
  const feedbacks = feedbacksData?.data || [];

  const hasFeedbacks = feedbacks.length > 0;

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MessageSquare size={44} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Feedback unavailable</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warning feedbacks</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.alertSummary}>
          <View style={styles.summaryIcon}>
            <ShieldAlert size={22} color="#B45309" />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMeta}>
              {alert.submittedBy ? `by ${alert.submittedBy}` : "Unknown"} •{" "}
              {formatDistanceToNow(new Date(alert.created_at), {
                addSuffix: true,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MessageSquare size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Feedback</Text>
            </View>
            {hasFeedbacks && !showComposer && (
              <TouchableOpacity
                style={styles.addSmallButton}
                onPress={() => setShowComposer(true)}
              >
                <CirclePlus size={16} color="#2D5A27" />
                <Text style={styles.addSmallButtonText}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>

          {showComposer && (
            <View style={styles.composer}>
              <Text style={styles.composerLabel}>Message</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Add feedback for this warning"
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.composerActions}>
                {hasFeedbacks && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowComposer(false);
                      setMessage("");
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={submitFeedback}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Send size={16} color="white" />
                  )}
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? "Sending..." : "Submit"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!hasFeedbacks && !showComposer && (
            <View style={styles.feedbackEmpty}>
              <MessageSquare size={34} color="#9CA3AF" />
              <Text style={styles.feedbackEmptyTitle}>No feedback yet</Text>
              <Text style={styles.feedbackEmptyText}>
                Be the first to reply to this warning.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => setShowComposer(true)}
              >
                <CirclePlus size={18} color="white" />
                <Text style={styles.emptyAddButtonText}>Add feedback</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasFeedbacks && (
            <View style={styles.feedbackList}>
              {feedbacks.map((feedback: any, index: number) => (
                <View key={`${feedback.id}`} style={styles.feedbackItem}>
                  <Text style={styles.feedbackMessage}>{feedback.message}</Text>
                  <Text style={styles.feedbackMeta}>
                    {feedback?.user?.full_name || "Unknown"} •{" "}
                    {formatDistanceToNow(new Date(feedback.created_at), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  alertSummary: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  alertMeta: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  addSmallButton: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addSmallButtonText: {
    color: "#2D5A27",
    fontWeight: "800",
    fontSize: 13,
  },
  composer: {
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 14,
  },
  composerLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  messageInput: {
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  composerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "800",
  },
  submitButton: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: "#2D5A27",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "800",
  },
  feedbackEmpty: {
    minHeight: 180,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  feedbackEmptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
    marginTop: 10,
  },
  feedbackEmptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  emptyAddButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#2D5A27",
    paddingHorizontal: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyAddButtonText: {
    color: "white",
    fontWeight: "800",
  },
  feedbackList: {
    gap: 10,
  },
  feedbackItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  feedbackMessage: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  feedbackMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#2D5A27",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
  },
});
