import { AppHeader } from "@/components/ui/AppHeader";
import { AppColors } from "@/constants/theme";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { FilterTabs } from "../components/ui/FilterTabs";
import { PaymentCard } from "../components/ui/PaymentCard";
import { StatusFilter } from "../components/ui/StatusFilter";

export default function AcordosScreen() {
  const [selectedTab, setSelectedTab] = useState("Filtro");

  const boletos = [
    { id: 1, name: "TIM", value: 511.0, dueDate: "13/10/2025", paid: false },
    { id: 2, name: "TIM", value: 511.0, dueDate: "13/10/2025", paid: false },
    { id: 3, name: "TIM", value: 511.0, dueDate: "13/10/2025", paid: true },
  ];

  const total = boletos.reduce((acc, b) => acc + b.value, 0);

  return (
    <View style={styles.container}>
      {/* Header vem do seu componente existente */}
      {/* <Header title="ACORDOS/BOLETOS" /> */}
      {/* Header */}
      <AppHeader title='Meus Acordos' />

      <FilterTabs selected={selectedTab} onChange={setSelectedTab} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <StatusFilter total={total} />

        {boletos.map((b) => (
          <PaymentCard
            key={b.id}
            name={b.name}
            value={b.value}
            dueDate={b.dueDate}
            paid={b.paid}
          />
        ))}
      </ScrollView>

      {/* BottomNavigation vem do seu componente existente */}
      {/* <BottomNavigation /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },
});
