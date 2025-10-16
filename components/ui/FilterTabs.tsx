import { Fonts } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FilterTabsProps {
  selected: string;
  onChange: (value: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ selected, onChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selected === "Tudo" && styles.activeTab]}
        onPress={() => onChange("Tudo")}
      >
        <Text style={[styles.text, selected === "Tudo" && styles.activeText]}>Tudo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selected === "Filtro" && styles.activeTab]}
        onPress={() => onChange("Filtro")}
      >
        <Text style={[styles.text, selected === "Filtro" && styles.activeText]}>Filtro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selected === "Ofertas" && styles.activeTab]}
        onPress={() => onChange("Ofertas")}
      >
        <Text style={[styles.text, selected === "Ofertas" && styles.activeText]}>Ofertas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 1,
    // borderColor: "#ddd",
    // borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FFA500",
  },
  text: {
    color: "#888",
    fontFamily: Fonts.medium,
  },
  activeText: {
    color: "#fff",
    fontFamily: Fonts.medium,
  },
});
