import { AppHeader } from "@/components/ui/AppHeader";
import { AppColors, Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { AcordosService, CNPJTitulos } from "@/services";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { FilterTabs } from "../components/ui/FilterTabs";
import { PaymentCard } from "../components/ui/PaymentCard";
import { StatusFilter } from "../components/ui/StatusFilter";

export default function AcordosScreen() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("Filtro");
  const [titulos, setTitulos] = useState<CNPJTitulos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTitulos();
  }, [user]);

  const loadTitulos = async () => {
    if (!user?.cpf_cnpj) {
      setError('CPF/CNPJ não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [data, err] = await AcordosService.getTitulos(user.cpf_cnpj);

      if (err) {
        setError(err);
      } else if (data) {
        setTitulos(data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar títulos:', err);
      setError('Erro ao carregar acordos');
    } finally {
      setLoading(false);
    }
  };

  // Converte títulos para formato de boletos
  const boletos = titulos.flatMap(cnpj =>
    cnpj.titulos.map(titulo => ({
      id: titulo.id,
      name: cnpj.name,
      value: Number(titulo.valor) || 0,
      dueDate: new Date(titulo.data_vencimento).toLocaleDateString('pt-BR'),
      paid: titulo.status === '1',
    }))
  );

  const total = boletos.reduce((acc, b) => acc + (Number(b.value) || 0), 0);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <AppHeader title='Meus Acordos' />

        <FilterTabs selected={selectedTab} onChange={setSelectedTab} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Carregando acordos...</Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && boletos.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum acordo encontrado</Text>
            </View>
          )}

          {!loading && !error && boletos.length > 0 && (
            <>
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
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: AppColors.background.secondary,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});
