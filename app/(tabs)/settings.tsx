import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

export default function TabTwoScreen() {
  const colorScheme = useColorScheme() || "light";
  const theme = Colors[colorScheme];

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [editField, setEditField] = useState<null | "targetWeight" | "height" | "age">(null);
  const [inputValue, setInputValue] = useState("");

  const handleDeleteAllData = async () => {
    try {
      await AsyncStorage.clear();
      setConfirmVisible(false);
    } catch (error) {
      console.log("Error clearing data", error);
    }
  };

  const handleMoreFromDeveloper = () => {
    const url = "https://github.com/radhika0910"; 
    Linking.openURL(url);
  };

  const handleSaveField = async () => {
    try {
      const json = await AsyncStorage.getItem("weightData");
      if (!json) return;
      let data = JSON.parse(json);

      if (data.length > 0 && editField !== null) {
        data[data.length - 1][editField] = parseFloat(inputValue);
      }

      await AsyncStorage.setItem("weightData", JSON.stringify(data));
      setEditField(null);
      setInputValue("");
    } catch (error) {
      console.log("Error updating value", error);
    }
  };

  const renderEditModal = () => (
    <Modal visible={!!editField} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Change {editField === "targetWeight" ? "Target Weight" : editField === "height" ? "Height" : "Age"}
          </Text>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter value"
            placeholderTextColor={theme.icon}
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.border }]} 
              onPress={() => setEditField(null)}
            >
              <Text style={{ color: theme.text }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.highlight }]} 
              onPress={handleSaveField}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      

      {/* Change Target Weight */}
      <View style={[styles.listItem, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.listButton} onPress={() => setEditField("targetWeight")}>
          <Text style={[styles.listText, { color: theme.text }]}>
            🎯 Change Target Weight
          </Text>
        </TouchableOpacity>
      </View>

      {/* Change Height */}
      <View style={[styles.listItem, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.listButton} onPress={() => setEditField("height")}>
          <Text style={[styles.listText, { color: theme.text }]}>
            📏 Change Height
          </Text>
        </TouchableOpacity>
      </View>

      {/* Change Age */}
      <View style={[styles.listItem, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.listButton} onPress={() => setEditField("age")}>
          <Text style={[styles.listText, { color: theme.text }]}>
            🎂 Change Age
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.listItem, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.listButton} onPress={handleMoreFromDeveloper}>
          <Text style={[styles.listText, { color: theme.text }]}>
            📂 More from the Developer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete All Data */}
      <View style={[styles.listItem, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.listButton} onPress={() => setConfirmVisible(true)}>
          <Text style={[styles.listText, { color: "#FF3B30" }]}>
            🗑 Delete All Data
          </Text>
        </TouchableOpacity>
      </View>

     

      {/* Confirmation Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Confirm Deletion
            </Text>
            <Text style={[styles.modalMessage, { color: theme.icon }]}>
              Are you sure you want to delete all app data? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.border }]} 
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: "#FF3B30" }]} 
                onPress={handleDeleteAllData}
              >
                <Text style={{ color: "#fff" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Field Modal */}
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  listItem: {
    borderBottomWidth: 1,
  },
  listButton: {
    paddingVertical: 16,
  },
  listText: {
    fontSize: 16,
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
  },
});
