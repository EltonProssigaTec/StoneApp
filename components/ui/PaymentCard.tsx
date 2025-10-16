import { Fonts } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PaymentCardProps {
  name: string;
  value: number;
  dueDate: string;
  paid?: boolean;
  onPress?: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  name,
  value,
  dueDate,
  paid = false,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.value}>Valor: R$ {value.toFixed(2)}</Text>
        <Text style={styles.date}>Vencimento: {dueDate}</Text>
      </View>
      {paid ? (
        <MaterialIcons name="check-circle" size={28} color="#FFA500" />
      ) : (
        <MaterialIcons name="receipt-long" size={28} color="#FFA500" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 20,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "#333",
  },
  value: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#555",
  },
  date: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#777",
  },
});
