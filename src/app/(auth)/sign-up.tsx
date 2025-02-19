import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import supabase from "../../lib/supabase";
import Button from "../../components/Button";

const SignUpScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [degreeModalVisible, setDegreeModalVisible] = useState(false);

  const [qualification, setQualification] = useState<{ degree: string; department: string; institution: string } | null>(null);
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const degreeOptions = [
    "MBBS",
    "MD",
    "MS",
    "BAMS",
    "BHMS",
    "MD(AYURVEDA)",
    "MD(HOMEOPATHY)",
    "DM",
    "MCh",
    "BDS/MDS",
    "BPharm/MPharm",
    "Pharm.D",
    "BSc./MSc.",
    "BPT/MPT",
    "Diploma in nursing",
    "Others"
  ];

  async function signUpWithEmail() {
    if (!qualification) {
      Alert.alert("Incomplete Information", "Please provide your qualification details.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role:'hcp',
          qualification: qualification ,
        },
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setLoading(false);
      Alert.alert("Success", "Please verify your email.");
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          title: "Sign Up ",
          headerStyle: { backgroundColor: "#0a7ea4" },
          headerTintColor: "#fff",
        }}
      />
      <Text style={styles.label}>Full Name</Text>
      <TextInput value={fullName} onChangeText={setFullName} placeholder="John Doe" style={styles.input} />

      <Text style={styles.label}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="john@gmail.com" style={styles.input} />

      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="Enter your password" style={styles.input} secureTextEntry />

      <Text style={styles.label}>Qualifiaction</Text>
  
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.qualificationButton}>
        <Text style={styles.qualificationButtonText}>{qualification ? "Edit Qualification" : "Enter Qualification"}</Text>
      </TouchableOpacity>

      {qualification && (
        <View style={styles.qualificationSummary}>
          <Text style={styles.summaryText}>Degree: {qualification.degree}</Text>
          <Text style={styles.summaryText}>Department: {qualification.department}</Text>
          <Text style={styles.summaryText}>Institution: {qualification.institution}</Text>
        </View>
      )}

      <Button text={loading ? 'Creating' :  'Create Account'} onPress={signUpWithEmail} />

      <TouchableOpacity onPress={() => router.replace("/sign-in")} style={styles.textButton}>
        <Text style={{ color: "#0a7ea4" }}>Already Have Account?</Text>
      </TouchableOpacity>

      {/* Modal for Qualification Entry */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Qualification Details</Text>

            <Text style={styles.label}>Degree</Text>
            <Pressable style={styles.input} onPress={() => setDegreeModalVisible(true)}>
              <Text>{degree || "Select your degree"}</Text>
              <FontAwesome
                name="chevron-right"
                size={15}
                color="gray"
              />
            </Pressable>

            <Text style={styles.label}>Department</Text>
            <TextInput value={department} onChangeText={setDepartment} placeholder="Enter your department" style={styles.input} />

            <Text style={styles.label}>Institution</Text>
            <TextInput value={institution} onChangeText={setInstitution} placeholder="Enter your institution" style={styles.input} />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setQualification({ degree, department, institution });
                  setModalVisible(false);
                }}
                style={[styles.button, styles.submitButton]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Degree Selection Modal */}
      <Modal animationType="slide" transparent visible={degreeModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentFixed}>
            <FlatList
              data={degreeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable onPress={() => {
                  setDegree(item);
                  setDegreeModalVisible(false);
                }} style={styles.modalItem}>
                  <Text style={styles.modalItemText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#f3f2ed" },
  label: { color: "gray", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "gray", padding: 10, marginBottom: 20, backgroundColor: "white", borderRadius: 5, flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',paddingLeft:5 },
  textButton: { alignSelf: "center", marginVertical: 10 },
  selectedRole: { backgroundColor: "#0a7ea4", borderColor: "#0a7ea4" },
  selectedRoleText: { color: "white" },
  roleText: { color: "black" },
  qualificationSummary: { padding: 10, borderRadius: 5, marginBottom: 20 },
  summaryText: { color: "#0a7ea4", fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", backgroundColor: "white", padding: 20, borderRadius: 10 },
  modalContentFixed: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10, maxHeight: 250 },
  modalItem: { padding: 15 },
  modalItemText: { fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  button: { padding: 10, borderRadius: 5, marginHorizontal: 10 },
  cancelButton: { backgroundColor: "gray" },
  submitButton: { backgroundColor: "#0a7ea4" },
  buttonText: { color: "white", fontWeight: "bold" },
  qualificationButton: { borderWidth:1,borderColor:'#0a7ea4', padding: 10, borderRadius: 5, alignItems: "center" ,marginBottom: 10, },
  qualificationButtonText: { color: "#0a7ea4", fontWeight: "bold" },
});

export default SignUpScreen;

