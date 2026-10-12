import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";

import { classesData } from "../../constants/classesData";
import { getStudents } from "../../services/studentService";
import {
  getFees,
  saveFee,
  updateFeePayment,
  FeeRecord,
} from "../../services/feeService";

type Student = {
  id: string;
  studentName?: string;
  name?: string;
  rollNo?: string | number;
  className: string;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  if (!value) return new Date();
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function FeeManagementScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [classFilter, setClassFilter] = useState("All");

  const [formClass, setFormClass] = useState("");
  const [studentId, setStudentId] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [feeType, setFeeType] = useState("Tuition Fee");
  const [totalFee, setTotalFee] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [temporaryDueDate, setTemporaryDueDate] = useState(new Date());

  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [editPaidAmount, setEditPaidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [studentData, feeData] = await Promise.all([
        getStudents(),
        getFees(),
      ]);

      setStudents(studentData as Student[]);
      setFees(feeData);
    } catch (error) {
      console.error("Fee screen loading failed:", error);
      Alert.alert("Error", "Unable to load students and fees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const visibleFees = fees.filter((fee) => {
    if (classFilter === "All") return true;

    const student = students.find(
      (item) => String(item.id) === String(fee.studentId)
    );

    return student?.className === classFilter;
  });

  const getStudentLabel = (id: string) => {
    const student = students.find(
      (item) => String(item.id) === String(id)
    );

    if (!student) return "Unknown student";

    return `${student.rollNo ?? "-"} - ${
      student.studentName ?? student.name ?? "Unnamed Student"
    }`;
  };

  const resetForm = () => {
    setFormClass("");
    setStudentId("");
    setAcademicYear("2026-27");
    setFeeType("Tuition Fee");
    setTotalFee("");
    setPaidAmount("");
    setDueDate("");
    setTemporaryDueDate(new Date());
  };

  const openDueDatePicker = () => {
    setTemporaryDueDate(dueDate ? parseDate(dueDate) : new Date());
    setShowDueDatePicker(true);
  };

  const handleDueDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDueDatePicker(false);
    }

    if (event.type === "dismissed") return;

    if (selectedDate) {
      setTemporaryDueDate(selectedDate);

      if (Platform.OS === "android") {
        setDueDate(formatDate(selectedDate));
      }
    }
  };

  const confirmIOSDueDate = () => {
    setDueDate(formatDate(temporaryDueDate));
    setShowDueDatePicker(false);
  };

  const handleSaveFee = async () => {
    const total = Number(totalFee);
    const paid = Number(paidAmount);

    if (!studentId || !dueDate || !totalFee.trim() || !paidAmount.trim()) {
      Alert.alert("Missing Information", "Please complete all fee fields.");
      return;
    }

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      total <= 0 ||
      paid < 0 ||
      paid > total
    ) {
      Alert.alert(
        "Invalid Amount",
        "Paid amount must be between zero and the total fee."
      );
      return;
    }

    setSaving(true);

    try {
      await saveFee(
        studentId,
        academicYear,
        feeType,
        total,
        paid,
        dueDate
      );

      Alert.alert("Success", "Fee record created.");
      resetForm();
      await loadData();
    } catch (error: any) {
      Alert.alert(
        "Could Not Save",
        error?.message ?? "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const beginPaymentUpdate = (fee: FeeRecord) => {
    setEditingFee(fee);
    setEditPaidAmount(String(fee.paidAmount ?? 0));
  };

  const cancelPaymentUpdate = () => {
    if (saving) return;

    setEditingFee(null);
    setEditPaidAmount("");
  };

  const handlePaymentUpdate = async () => {
    if (!editingFee) return;

    const paid = Number(editPaidAmount);

    if (
      !editPaidAmount.trim() ||
      !Number.isFinite(paid) ||
      paid < 0 ||
      paid > Number(editingFee.totalFee)
    ) {
      Alert.alert(
        "Invalid Payment",
        "Enter a valid paid amount not exceeding the total fee."
      );
      return;
    }

    setSaving(true);

    try {
      await updateFeePayment(
        editingFee.firestoreId,
        Number(editingFee.totalFee),
        paid
      );

      setEditingFee(null);
      setEditPaidAmount("");

      await loadData();

      Alert.alert("Success", "Payment updated successfully.");
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.message ?? "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.heading}>Fee Management</Text>

        <Text style={styles.subtitle}>
          Create fee records and track outstanding payments.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Create Fee Record</Text>

          <Text style={styles.label}>Class</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formClass}
              onValueChange={(value) => {
                setFormClass(value);

                const firstStudent = students.find(
                  (student) => student.className === value
                );

                setStudentId(
                  firstStudent ? String(firstStudent.id) : ""
                );
              }}
            >
              <Picker.Item label="Select Class" value="" />

              {classesData.map((cls) => (
                <Picker.Item
                  key={cls}
                  label={cls}
                  value={cls}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Student</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={studentId}
              onValueChange={setStudentId}
              enabled={Boolean(formClass)}
            >
              <Picker.Item label="Select Student" value="" />

              {students
                .filter(
                  (student) => student.className === formClass
                )
                .map((student) => (
                  <Picker.Item
                    key={student.id}
                    label={getStudentLabel(String(student.id))}
                    value={String(student.id)}
                  />
                ))}
            </Picker>
          </View>

          <Text style={styles.label}>Academic Year</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={academicYear}
              onValueChange={setAcademicYear}
            >
              <Picker.Item label="2026-27" value="2026-27" />
              <Picker.Item label="2027-28" value="2027-28" />
            </Picker>
          </View>

          <Text style={styles.label}>Fee Type</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={feeType}
              onValueChange={setFeeType}
            >
              <Picker.Item label="Tuition Fee" value="Tuition Fee" />
              <Picker.Item label="Transport Fee" value="Transport Fee" />
              <Picker.Item label="Examination Fee" value="Examination Fee" />
              <Picker.Item label="Library Fee" value="Library Fee" />
              <Picker.Item label="Miscellaneous" value="Miscellaneous" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Total Fee (₹)"
            keyboardType="numeric"
            value={totalFee}
            onChangeText={setTotalFee}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Amount Paid (₹)"
            keyboardType="numeric"
            value={paidAmount}
            onChangeText={setPaidAmount}
            returnKeyType="done"
          />

          <Text style={styles.label}>Due Date</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={openDueDatePicker}
            accessibilityRole="button"
            accessibilityLabel="Choose fee due date"
          >
            <Text
              style={
                dueDate ? styles.dateValue : styles.datePlaceholder
              }
            >
              {dueDate || "Select due date"}
            </Text>

            <Text style={styles.calendarIcon}>▦</Text>
          </TouchableOpacity>

          {showDueDatePicker && (
            <View style={styles.datePickerPanel}>
              <DateTimePicker
                value={temporaryDueDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleDueDateChange}
                minimumDate={new Date(2020, 0, 1)}
              />

              {Platform.OS === "ios" && (
                <View style={styles.datePickerActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDueDatePicker(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallPrimaryButton}
                    onPress={confirmIOSDueDate}
                  >
                    <Text style={styles.buttonText}>Use Date</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            onPress={handleSaveFee}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Create Fee"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Existing Fees</Text>

          <TouchableOpacity onPress={() => void loadData()}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={classFilter}
            onValueChange={setClassFilter}
          >
            <Picker.Item label="All Classes" value="All" />

            {classesData.map((cls) => (
              <Picker.Item
                key={cls}
                label={cls}
                value={cls}
              />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : visibleFees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No fee records found.
            </Text>
          </View>
        ) : (
          visibleFees.map((fee) => (
            <View
              key={fee.firestoreId}
              style={styles.feeCard}
            >
              <Text style={styles.studentName}>
                {getStudentLabel(String(fee.studentId))}
              </Text>

              <Text style={styles.detail}>
                {fee.feeType} · {fee.academicYear}
              </Text>

              <Text style={styles.detail}>
                Total: {formatMoney(fee.totalFee)}
              </Text>

              <Text style={styles.detail}>
                Paid: {formatMoney(fee.paidAmount)}
              </Text>

              <Text style={styles.balance}>
                Balance: {formatMoney(fee.dueAmount)}
              </Text>

              <Text style={styles.detail}>
                Due date: {fee.dueDate}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  fee.status === "Paid"
                    ? styles.paidBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    fee.status === "Paid"
                      ? styles.paidText
                      : styles.pendingText,
                  ]}
                >
                  {fee.status}
                </Text>
              </View>

              {fee.status !== "Paid" && (
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => beginPaymentUpdate(fee)}
                >
                  <Text style={styles.buttonText}>
                    Update Payment
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Centered Update Payment Modal */}
      <Modal
        visible={Boolean(editingFee)}
        transparent
        animationType="fade"
        onRequestClose={cancelPaymentUpdate}
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardContainer}
          >
            <View style={styles.modalCard}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.modalTitle}>
                  Update Payment
                </Text>

                {editingFee && (
                  <>
                    <Text style={styles.detail}>
                      {getStudentLabel(String(editingFee.studentId))} ·{" "}
                      {editingFee.feeType}
                    </Text>

                    <Text style={styles.detail}>
                      Total fee: {formatMoney(editingFee.totalFee)}
                    </Text>

                    <Text style={styles.detail}>
                      Current paid: {formatMoney(editingFee.paidAmount)}
                    </Text>

                    <Text style={styles.detail}>
                      Outstanding: {formatMoney(editingFee.dueAmount)}
                    </Text>
                  </>
                )}

                <Text style={styles.label}>
                  Total amount paid so far (₹)
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter total amount paid"
                  keyboardType="numeric"
                  value={editPaidAmount}
                  onChangeText={setEditPaidAmount}
                  autoFocus
                  returnKeyType="done"
                />

                <TouchableOpacity
                  style={[
                    styles.button,
                    saving && styles.disabledButton,
                  ]}
                  disabled={saving}
                  onPress={handlePaymentUpdate}
                >
                  <Text style={styles.buttonText}>
                    {saving ? "Updating..." : "Update Payment"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  disabled={saving}
                  onPress={cancelPaymentUpdate}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 5,
    color: "#334155",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    color: "#0F172A",
  },
  dateButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateValue: {
    color: "#0F172A",
    fontSize: 15,
  },
  datePlaceholder: {
    color: "#94A3B8",
    fontSize: 15,
  },
  calendarIcon: {
    color: "#2563EB",
    fontSize: 20,
  },
  datePickerPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 8,
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 9,
    marginTop: 16,
    alignItems: "center",
  },
  smallPrimaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  refreshText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  feeCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  studentName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: "#475569",
    marginTop: 5,
  },
  balance: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  paidBadge: {
    backgroundColor: "#DCFCE7",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  paidText: {
    color: "#166534",
  },
  pendingText: {
    color: "#92400E",
  },
  updateButton: {
    backgroundColor: "#0F766E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 4,
  },
  cancelText: {
    color: "#d23718",
    fontWeight: "600",
  },
  emptyCard: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
  },
  loader: {
    marginVertical: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalKeyboardContainer: {
    width: "100%",
    maxWidth: 460,
    justifyContent: "center",
  },
  modalCard: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 12,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
});