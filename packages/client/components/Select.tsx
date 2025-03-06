import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dialog, ListItem, SizableText, Square, YGroup } from "tamagui";

type Option = {
  label: string;
  value: string | number;
};

type SelectProps = {
  options: Option[];
  selectedValue?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
};

const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select an option",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string | number) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const selectedLabel = selectedValue
    ? options.find((option) => option.value === selectedValue)?.label
    : placeholder;

  return (
    <>
      {Platform.OS === "web" ? (
        <>
          <Square
            borderRadius="$2"
            onPress={() => setModalVisible(!modalVisible)}
            backgroundColor="$accentBackground"
            padding="$2"
          >
            <SizableText size="$5">{selectedLabel}</SizableText>
          </Square>
          <Dialog open={modalVisible}>
            <Dialog.Portal zIndex={2000000000}>
              <Dialog.Overlay />
              <Dialog.Content minWidth="50%">
                <YGroup>
                  {options.map((option, index) => (
                    <YGroup.Item key={index}>
                      <ListItem onPress={() => handleSelect(option.value)}>
                        <SizableText>{option.label}</SizableText>
                      </ListItem>
                    </YGroup.Item>
                  ))}
                </YGroup>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        </>
      ) : (
        <View style={{ width: "100%" }}>
          {/* Trigger Button */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectButtonText}>
              {selectedValue
                ? options.find((option) => option.value === selectedValue)
                    ?.label
                : placeholder}
            </Text>
          </TouchableOpacity>

          {/* Modal for Options */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "rgb(235, 235, 235)",
    borderRadius: 10,
    backgroundColor: "#F8F8F8", // 背景色
    width: "100%",
  },
  selectButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
});

export default Select;
