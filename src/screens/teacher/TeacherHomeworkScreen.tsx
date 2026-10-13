
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../../firebase/firebaseConfig";
import {
  getHomework,
  saveHomework,
  updateHomework,
  Homework,
} from "../../services/homeworkService";

export default function TeacherHomeworkScreen() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [homework, setHomework] = useState<Homework[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadHomework = async () => {
    try {
      setRefreshing(true);
      const data = await getHomework();
      setHomework(data);
    } catch (error) {
      console.error("Failed to load homework:", error);
      Alert.alert("Error", "Unable to load homework history.");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHomework();
    }, [])
  );

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setDueDate(formatDate(selectedDate));
    }
  };

  const resetForm = () => {
    setClassName("");
    setSubject("");
    setTask("");
    setDueDate("");
    setEditingId(null);
    setShowDatePicker(false);
  };

  const closeEditModal = () => {
    if (loading) return;

    setEditModalVisible(false);
    resetForm();
  };

  const startEditing = (item: Homework) => {
    setEditingId(item.firestoreId);
    setClassName(item.className);
    setSubject(item.subject);
    setTask(item.task);
    setDueDate(item.dueDate);
    setShowDatePicker(false);
    setEditModalVisible(true);
  };

  const submitNewHomework = async () => {
    if (!className || !subject.trim() || !task.trim() || !dueDate) {
      Alert.alert("Missing Details", "Please fill in all fields.");
      return;
    }

    const teacherUid = auth.currentUser?.uid;

    if (!teacherUid) {
      Alert.alert("Session Expired", "Please log in again.");
      return;
    }

    try {
      setLoading(true);

      await saveHomework(
        className,
        subject.trim(),
        task.trim(),
        dueDate,
        teacherUid
      );

      resetForm();
      await loadHomework();

      Alert.alert("Success", "Homework posted successfully.");
    } catch (error) {
      console.error("Failed to post homework:", error);
      Alert.alert("Error", "Failed to post homework. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitHomeworkUpdate = async () => {
    if (!editingId) return;

    if (!className || !subject.trim() || !task.trim() || !dueDate) {
      Alert.alert("Missing Details", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await updateHomework(
        editingId,
        className,
        subject.trim(),
        task.trim(),
        dueDate
      );

      setEditModalVisible(false);
      resetForm();

      await loadHomework();

      Alert.alert(
        "Success",
        "Homework updated and parent notifications sent."
      );
    } catch (error) {
      console.error("Failed to update homework:", error);
      Alert.alert(
        "Update Error",
        "Could not update homework. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderClassPicker = () => (
    <View style={styles.pickerContainer}>
      <Picker selectedValue={className} onValueChange={setClassName}>
        <Picker.Item label="Select Class" value="" />
        {Array.from({ length: 10 }, (_, index) => {
          const number = index + 1;

          return (
            <Picker.Item
              key={number}
              label={`Class ${number}`}
              value={String(number)}
            />
          );
        })}
      </Picker>
    </View>
  );

  const renderDatePicker = () => (
    <>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={dueDate ? styles.dateText : styles.placeholderText}>
          {dueDate || "Choose due date"}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={
            dueDate
              ? new Date(`${dueDate}T12:00:00`)
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadHomework}
            />
          }
        >
          <Text style={styles.title}>Post Homework</Text>

          <Text style={styles.label}>Class</Text>
          {renderClassPicker()}

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter subject"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Homework Details</Text>
          <TextInput
            style={styles.taskInput}
            placeholder="Describe the homework"
            value={task}
            onChangeText={setTask}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Due Date</Text>
          {renderDatePicker()}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={submitNewHomework}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Posting..." : "Post Homework"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.historyTitle}>Homework History</Text>

          {homework.length === 0 ? (
            <Text style={styles.emptyText}>
              No homework has been posted yet.
            </Text>
          ) : (
            homework.map((item) => (
              <View key={item.firestoreId} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.subject} · Class {item.className}
                </Text>

                <Text style={styles.cardTask}>{item.task}</Text>

                <Text style={styles.dueText}>
                  Due date: {item.dueDate}
                </Text>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => startEditing(item)}
                >
                  <Text style={styles.editButtonText}>Edit Homework</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingContainer}>
                <Text style={styles.modalTitle}>Edit Homework</Text>
                <Text style={styles.modalSubtitle}>
                  Update the assignment details below.
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeEditModal}
                disabled={loading}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Class</Text>
              {renderClassPicker()}

              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject"
                value={subject}
                onChangeText={setSubject}
              />

              <Text style={styles.label}>Homework Details</Text>
              <TextInput
                style={styles.taskInput}
                placeholder="Describe the homework"
                value={task}
                onChangeText={setTask}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.label}>Due Date</Text>
              {renderDatePicker()}

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && styles.disabledButton,
                ]}
                onPress={submitHomeworkUpdate}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeEditModal}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const PRIMARY = "#1565C0";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F5F7FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 18,
    elevation: 2,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 18,
    elevation: 2,
    fontSize: 16,
    color: "#1E293B",
  },
  taskInput: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 18,
    minHeight: 120,
    elevation: 2,
    fontSize: 16,
    color: "#1E293B",
  },
  dateButton: {
    backgroundColor: "white",
    minHeight: 52,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 18,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: "#1E293B",
  },
  placeholderText: {
    fontSize: 16,
    color: "#94A3B8",
  },
  calendarIcon: {
    fontSize: 20,
  },
  button: {
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 30,
    marginBottom: 15,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  cardTask: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 8,
  },
  dueText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#E0ECFF",
    borderRadius: 8,
    padding: 11,
    alignItems: "center",
  },
  editButtonText: {
    color: PRIMARY,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalHeadingContainer: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: PRIMARY,
  },
  modalSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#64748B",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: "#64748B",
    fontSize: 21,
  },
  modalCancelButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  modalCancelText: {
    color: "#B91C1C",
    fontWeight: "bold",
    fontSize: 16,
  },
});
