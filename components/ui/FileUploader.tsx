// components/FileUploader.tsx
import axios, { isCancel } from "axios";
import { getSafeErrorMessage } from "@/services/axiosInstance";
import { Camera, FileText, ImagePlus, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type UploadKind = "image" | "video" | "document";

export type UploadedFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  type: UploadKind;
  url?: string;
  file?: Blob;
  timestamp: number;
};

type FileUploaderProps = {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;

  allowImages?: boolean;
  allowVideos?: boolean;
  allowDocuments?: boolean;

  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;

  uploadUrl?: string;
  uploadFieldName?: string;
  uploadHeaders?: Record<string, string>;

  uploadHandler?: (file: UploadedFile) => Promise<string>;
  uploadKey?: string;

  enableCamera?: boolean;
  enablePreview?: boolean;
  disabled?: boolean;

  buttonText?: string;
  uploadMode?: "immediate" | "deffered";
};

type UploadSnapshot = {
  active: boolean;
  progress: number;
  fileName?: string;
};

type ActiveUpload = {
  abortController: AbortController;
  snapshot: UploadSnapshot;
  listeners: Set<(snapshot: UploadSnapshot) => void>;
};

type ImagePickerAsset = import("expo-image-picker").ImagePickerAsset;
type ImagePickerModule = typeof import("expo-image-picker");
type DocumentPickerModule = typeof import("expo-document-picker");

const activeUploads = new Map<string, ActiveUpload>();

const notifyUploadListeners = (key: string) => {
  const upload = activeUploads.get(key);
  if (!upload) return;
  upload.listeners.forEach((listener) => listener(upload.snapshot));
};

const setUploadSnapshot = (key: string, snapshot: Partial<UploadSnapshot>) => {
  const upload = activeUploads.get(key);
  if (!upload) return;
  upload.snapshot = { ...upload.snapshot, ...snapshot };
  notifyUploadListeners(key);
};

const getUploadUrl = (data: any, fallbackUri: string) => {
  const possibleUrl =
    data?.url ||
    data?.file?.url ||
    data?.data?.url ||
    data?.data?.file?.url ||
    data?.secure_url ||
    data?.path ||
    data?.location;

  return typeof possibleUrl === "string" && possibleUrl.length > 0
    ? possibleUrl
    : fallbackUri;
};

const unwrapExpoModule = <T extends Record<string, any>>(module: T) => {
  return (module.default || module) as T;
};

const loadImagePicker = async (): Promise<ImagePickerModule | null> => {
  try {
    const ImagePicker = unwrapExpoModule(await import("expo-image-picker"));
    if (
      typeof ImagePicker.requestMediaLibraryPermissionsAsync !== "function" ||
      typeof ImagePicker.requestCameraPermissionsAsync !== "function" ||
      typeof ImagePicker.launchImageLibraryAsync !== "function" ||
      typeof ImagePicker.launchCameraAsync !== "function"
    ) {
      return null;
    }
    return ImagePicker;
  } catch {
    return null;
  }
};

const loadDocumentPicker = async (): Promise<DocumentPickerModule | null> => {
  try {
    const DocumentPicker = unwrapExpoModule(
      await import("expo-document-picker"),
    );
    if (typeof DocumentPicker.getDocumentAsync !== "function") {
      return null;
    }
    return DocumentPicker;
  } catch {
    return null;
  }
};

export default function FileUploader({
  value = [],
  onChange,
  allowImages = true,
  allowVideos = true,
  allowDocuments = false,
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 25,
  uploadUrl,
  uploadFieldName = "file",
  uploadHeaders,
  uploadHandler,
  uploadKey,
  enableCamera = true,
  enablePreview = true,
  disabled = false,
  buttonText = "Upload file",
  uploadMode = "deffered",
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const resolvedUploadKey = useMemo(
    () => uploadKey || `${uploadUrl || "local"}:${uploadFieldName}`,
    [uploadFieldName, uploadKey, uploadUrl],
  );
  const [uploadState, setUploadState] = useState<UploadSnapshot>(() => {
    return (
      activeUploads.get(resolvedUploadKey)?.snapshot || {
        active: false,
        progress: 0,
      }
    );
  });
  const mountedRef = useRef(true);

  const allowedCount = multiple ? maxFiles : 1;
  const uploading = uploadState.active;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setFiles(value);
  }, [value]);

  useEffect(() => {
    const upload = activeUploads.get(resolvedUploadKey);
    if (!upload) {
      setUploadState({ active: false, progress: 0 });
      return;
    }

    const listener = (snapshot: UploadSnapshot) => setUploadState(snapshot);
    upload.listeners.add(listener);
    setUploadState(upload.snapshot);

    return () => {
      upload.listeners.delete(listener);
    };
  }, [resolvedUploadKey]);

  const emitChange = (nextFiles: UploadedFile[]) => {
    if (mountedRef.current) {
      setFiles(nextFiles);
    }
    onChange?.(nextFiles);
  };

  const getImagePickerMediaTypes = () => {
    if (allowImages && allowVideos) return ["images", "videos"] as any;
    if (allowImages) return ["images"] as any;
    if (allowVideos) return ["videos"] as any;
    return ["images"] as any;
  };

  const normalizeAsset = (asset: ImagePickerAsset): UploadedFile => {
    const mimeType = asset.mimeType;
    const type: UploadKind = mimeType?.startsWith("video") ? "video" : "image";

    return {
      uri: asset.uri,
      name: asset.fileName || `upload-${Date.now()}`,
      mimeType,
      size: asset.fileSize,
      type,
      file: (asset as any).file,
      timestamp: Date.now(),
    };
  };

  const normalizeDocumentAsset = (asset: {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
    lastModified?: number;
    file?: Blob;
  }): UploadedFile => {
    const mimeType = asset.mimeType;
    const type: UploadKind = mimeType?.startsWith("video")
      ? "video"
      : mimeType?.startsWith("image")
        ? "image"
        : "document";

    return {
      uri: asset.uri,
      name: asset.name,
      mimeType,
      size: asset.size,
      type,
      file: asset.file,
      timestamp: asset.lastModified || Date.now(),
    };
  };

  const validateFiles = (newFiles: UploadedFile[]) => {
    if (files.length + newFiles.length > allowedCount) {
      Alert.alert(
        "Too many files",
        `You can upload up to ${allowedCount} file(s).`,
      );
      return false;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const file of newFiles) {
      if (file.size && file.size > maxBytes) {
        Alert.alert("File too large", `${file.name} exceeds ${maxSizeMB}MB.`);
        return false;
      }

      if (file.type === "image" && !allowImages) return false;
      if (file.type === "video" && !allowVideos) return false;
      if (file.type === "document" && !allowDocuments) return false;
    }

    return true;
  };

  const defaultUpload = async (
    file: UploadedFile,
    signal?: AbortSignal,
    onProgress?: (progress: number) => void,
  ): Promise<string> => {
    if (!uploadUrl) {
      // Fallback for local-only usage.
      // For production, provide uploadUrl or uploadHandler.
      onProgress?.(1);
      return file.uri;
    }

    const formData = new FormData();

    if (file.file) {
      formData.append(uploadFieldName, file.file, file.name);
    } else {
      formData.append(uploadFieldName, {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);
    }

    const response = await axios
      .post(uploadUrl, formData, {
        headers: uploadHeaders,
        signal,
        onUploadProgress: (event) => {
          if (!event.total) return;
          onProgress?.(Math.min(event.loaded / event.total, 0.98));
        },
      })
      .catch((err) => {
        console.log("\n\n\n\n\ upload-error\n\n ", err, "\n\n\n\n end \n\n ");
      });

    const data = response?.data;
    onProgress?.(1);
    return getUploadUrl(data, file.uri);
  };

  const uploadFiles = async (newFiles: UploadedFile[]) => {
    if (!validateFiles(newFiles)) return;

    if (uploadMode !== "immediate") {
      emitChange([...files, ...newFiles]);
      return;
    }

    const abortController = new AbortController();
    const listeners =
      activeUploads.get(resolvedUploadKey)?.listeners ||
      new Set<(snapshot: UploadSnapshot) => void>();
    activeUploads.set(resolvedUploadKey, {
      abortController,
      listeners,
      snapshot: {
        active: true,
        progress: 0,
        fileName: newFiles[0]?.name,
      },
    });
    setUploadState({
      active: true,
      progress: 0,
      fileName: newFiles[0]?.name,
    });
    notifyUploadListeners(resolvedUploadKey);

    try {
      const uploaded = await Promise.all(
        newFiles.map(async (file, index) => {
          const startingProgress =
            newFiles.length > 1 ? index / newFiles.length : 0;
          setUploadState({
            active: true,
            fileName: file.name,
            progress: startingProgress,
          });
          setUploadSnapshot(resolvedUploadKey, {
            fileName: file.name,
            progress: startingProgress,
          });
          const url = uploadHandler
            ? await uploadHandler(file)
            : await defaultUpload(
                file,
                abortController.signal,
                (fileProgress) => {
                  const overallProgress =
                    (index + fileProgress) / newFiles.length;
                  setUploadState({
                    active: true,
                    fileName: file.name,
                    progress: overallProgress,
                  });
                  setUploadSnapshot(resolvedUploadKey, {
                    progress: overallProgress,
                  });
                },
              );

          return {
            ...file,
            url,
          };
        }),
      );

      emitChange([...files, ...uploaded]);
    } catch (error: any) {
      if (!isCancel(error) && error?.name !== "CanceledError") {
        Alert.alert(
          "Upload error",
          getSafeErrorMessage(error, "Something went wrong."),
        );
      }
    } finally {
      setUploadState({
        active: false,
        progress: 0,
        fileName: undefined,
      });
      setUploadSnapshot(resolvedUploadKey, {
        active: false,
        progress: 0,
        fileName: undefined,
      });
      activeUploads.delete(resolvedUploadKey);
    }
  };

  const cancelUpload = () => {
    activeUploads.get(resolvedUploadKey)?.abortController.abort();
  };

  const pickFromGallery = async () => {
    if (!allowImages && !allowVideos) {
      Alert.alert("Not allowed", "Image and video uploads are disabled.");
      return;
    }

    try {
      const ImagePicker = await loadImagePicker();

      if (!ImagePicker && Platform.OS === "android") {
        await pickMediaWithDocumentPicker();
        return;
      }

      if (!ImagePicker) {
        Alert.alert(
          "Media picker unavailable",
          "Please rebuild the app so the media picker native module is included.",
        );
        return;
      }

      let permission;
      try {
        permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch {
        if (Platform.OS === "android") {
          await pickMediaWithDocumentPicker();
          return;
        }
        Alert.alert("Media picker unavailable", "Please try again.");
        return;
      }

      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow media library access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getImagePickerMediaTypes(),
        allowsMultipleSelection: multiple,
        quality: 0.8,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (result.canceled) return;

      const selected = result.assets.map(normalizeAsset);
      await uploadFiles(selected);
    } catch {
      Alert.alert("Media picker unavailable", "Please try again.");
    }
  };

  const captureWithCamera = async () => {
    try {
      const ImagePicker = await loadImagePicker();

      if (!ImagePicker) {
        Alert.alert(
          "Camera unavailable",
          "Please rebuild the app so the camera picker native module is included.",
        );
        return;
      }

      let permission;
      try {
        permission = await ImagePicker.requestCameraPermissionsAsync();
      } catch {
        Alert.alert(
          "Camera unavailable",
          "Please rebuild the app so the camera picker native module is included.",
        );
        return;
      }

      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: getImagePickerMediaTypes(),
        quality: 0.8,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (result.canceled) return;

      const selected = result.assets.map(normalizeAsset);
      await uploadFiles(selected);
    } catch {
      Alert.alert("Camera unavailable", "Please try again.");
    }
  };

  const pickMediaWithDocumentPicker = async () => {
    const DocumentPicker = await loadDocumentPicker();

    if (!DocumentPicker) {
      Alert.alert(
        "File picker unavailable",
        "Please rebuild the app so the document picker native module is included.",
      );
      return;
    }

    let result;
    try {
      result = await DocumentPicker.getDocumentAsync({
        multiple,
        copyToCacheDirectory: true,
        type:
          allowImages && allowVideos
            ? ["image/*", "video/*"]
            : allowImages
              ? "image/*"
              : "video/*",
      });
    } catch {
      Alert.alert("File picker unavailable", "Please try again.");
      return;
    }

    if (result.canceled) return;

    const selected = result.assets.map(normalizeDocumentAsset);
    await uploadFiles(selected);
  };

  const pickDocument = async () => {
    if (!allowDocuments) {
      Alert.alert("Not allowed", "Document uploads are disabled.");
      return;
    }

    const DocumentPicker = await loadDocumentPicker();

    if (!DocumentPicker) {
      Alert.alert(
        "File picker unavailable",
        "Please rebuild the app so the document picker native module is included.",
      );
      return;
    }

    let result;
    try {
      result = await DocumentPicker.getDocumentAsync({
        multiple,
        copyToCacheDirectory: true,
        type: "*/*",
      });
    } catch {
      Alert.alert("File picker unavailable", "Please try again.");
      return;
    }

    if (result.canceled) return;

    const selected = result.assets.map((asset) => ({
      ...normalizeDocumentAsset(asset),
      type: "document" as const,
    }));

    await uploadFiles(selected);
  };

  const removeFile = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    emitChange(nextFiles);
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable
          disabled={disabled || uploading}
          style={[
            styles.button,
            (disabled || uploading) && styles.buttonDisabled,
          ]}
          onPress={pickFromGallery}
        >
          <ImagePlus size={18} color="white" />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>

        {enableCamera && (
          <Pressable
            disabled={disabled || uploading}
            style={[
              styles.secondaryButton,
              (disabled || uploading) && styles.secondaryButtonDisabled,
            ]}
            onPress={captureWithCamera}
          >
            <Camera size={18} color="#111827" />
            <Text style={styles.secondaryButtonText}>Camera</Text>
          </Pressable>
        )}

        {allowDocuments && (
          <Pressable
            disabled={disabled || uploading}
            style={[
              styles.secondaryButton,
              (disabled || uploading) && styles.secondaryButtonDisabled,
            ]}
            onPress={pickDocument}
          >
            <FileText size={18} color="#111827" />
            <Text style={styles.secondaryButtonText}>Document</Text>
          </Pressable>
        )}
      </View>

      {uploading && (
        <View style={styles.uploadPanel}>
          <View style={styles.uploadHeader}>
            <View style={styles.loaderBadge}>
              <ActivityIndicator color="#16A34A" />
            </View>
            <View style={styles.uploadCopy}>
              <Text style={styles.uploadTitle}>Uploading evidence</Text>
              <Text numberOfLines={1} style={styles.uploadFileName}>
                {uploadState.fileName || "Preparing upload"}
              </Text>
            </View>
            <Pressable style={styles.cancelButton} onPress={cancelUpload}>
              <X size={16} color="#991B1B" />
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
          <Text style={styles.uploadHint}>
            You can move between steps while this finishes.
          </Text>
        </View>
      )}

      {enablePreview && files.length > 0 && (
        <View style={styles.previewList}>
          {files.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.previewItem}>
              {file.type === "image" ? (
                <Image source={{ uri: file.uri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.filePreview}>
                  <Text style={styles.fileType}>{file.type.toUpperCase()}</Text>
                  <Text numberOfLines={2} style={styles.fileName}>
                    {file.name}
                  </Text>
                </View>
              )}

              <Pressable
                style={styles.removeButton}
                onPress={() => removeFile(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButtonDisabled: {
    opacity: 0.65,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  uploadPanel: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  uploadHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  loaderBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCopy: {
    flex: 1,
    minWidth: 0,
  },
  uploadTitle: {
    color: "#14532D",
    fontSize: 14,
    fontWeight: "700",
  },
  uploadFileName: {
    color: "#166534",
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cancelText: {
    color: "#991B1B",
    fontWeight: "700",
    fontSize: 12,
  },
  uploadHint: {
    color: "#166534",
    fontSize: 12,
  },
  previewList: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  previewItem: {
    width: 110,
    marginRight: 12,
    position: "relative",
  },
  imagePreview: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  filePreview: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  fileType: {
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  fileName: {
    fontSize: 11,
    textAlign: "center",
  },
  removeButton: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "white",
    fontSize: 18,
    lineHeight: 20,
  },
});
