import { UserContext } from "@/context/UserContext";
import { getInitials } from "@/utils/constants";
import { Mail } from "lucide-react-native";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const ProfileCard = () => {
  const { user } = useContext(UserContext);
  return (
    <View style={styles.card}>
      <View style={styles.pictureContainer}>
        <View style={styles.image}>
          {user?.profilePicture ? (
            <Image
              source={require("@/assets/images/person.jpg")}
              resizeMode="cover"
              resizeMethod="resize"
              style={{
                width: 140,
                height: 140,
                borderRadius: 8,
              }}
            />
          ) : (
            <View style={styles.avFallbackCont}>
              <Text style={styles.avatarFallback}>
                {getInitials(user?.fullName || "App User")}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View>
        <Text style={styles.fullName}>{user?.fullName || ""}</Text>
        <View style={styles.emailContainer}>
          <Mail size={16} />
          <Text style={styles.email}>{user?.email || ""}</Text>
        </View>
        <View style={styles.roleContainer}>
          <Text style={styles.role}>{user?.role || ""}</Text>
        </View>
      </View>
      <View style={styles.orgOccCont}>
        <View style={styles.orgOccCard}>
          <Text style={styles.orgOccCardLabel}>Occupation</Text>
          <Text>{user?.occupation || ""}</Text>
        </View>
        <View style={styles.orgOccCard}>
          <Text style={styles.orgOccCardLabel}>Organization</Text>
          <Text>{user?.organization || ""}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "white",
    marginHorizontal: 24,
  },
  pictureContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    height: "auto",
  },
  image: {
    borderRadius: 8,

    // objectFit: "contain",
  },
  avFallbackCont: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 140,
    height: 140,
    backgroundColor: "#2D5A27",
    borderRadius: 12,
  },
  avatarFallback: {
    color: "#FFF",
    fontSize: 60,
    fontWeight: "bold",
  },
  fullName: {
    fontWeight: "bold",
    textAlign: "center",
    marginBlock: 2,
    marginTop: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: "normal",
    marginBlock: 8,
    textAlign: "center",
    color: "#6B7280",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  role: {
    paddingBlock: 6,
    paddingInline: 16,
    backgroundColor: "#2D5A27",
    borderRadius: 6,
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
  },
  orgOccCont: {
    marginTop: 16,
    flexDirection: "row",
    gap: 4,
    justifyContent: "space-between",
  },
  orgOccCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    marginHorizontal: 8,
    width: "50%",
  },
  orgOccCardLabel: {
    fontWeight: "bold",
    marginBottom: 6,
  },
});
