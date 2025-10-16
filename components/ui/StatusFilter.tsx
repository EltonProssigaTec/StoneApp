import { AppColors, Fonts } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatusFilterProps {
  total: number;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ total }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MaterialIcons name="check-circle" size={20} color="#FFA500" />
        <Text style={styles.text}> Pago</Text>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="hourglass-empty" size={20} color="#FFA500" />
        <Text style={styles.text}> Pendente</Text>
      </View>
      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 20,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#333",
  },
  total: {
    textAlign: "right",
    fontFamily: Fonts.regular,
    marginTop: 5,
    color: "#888",
  },
});
