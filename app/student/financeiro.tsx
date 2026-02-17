import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FinanceiroAluno() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal do PIX
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("");

  // --- COLOQUE AQUI OS DADOS REAIS DA SUA ACADEMIA ---
  const PIX_KEY = "12.345.678/0001-90"; // Sua chave PIX (CNPJ, Email, Telemóvel)
  const PIX_NAME = "Academia Rugido Oficial"; // Nome que aparece no banco

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: false });

      if (!error && data) setPayments(data);
      setLoading(false);
    };
    fetchPayments();
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pago":
        return { color: "#00E676", bg: "rgba(0, 230, 118, 0.15)", icon: "check-circle", text: "Pago" };
      case "atrasado":
        return { color: "#FF3B30", bg: "rgba(255, 59, 48, 0.15)", icon: "alert-circle", text: "Atrasado" };
      default:
        return { color: "#FFC107", bg: "rgba(255, 193, 7, 0.15)", icon: "clock", text: "Pendente" };
    }
  };

  const handleOpenPix = (amount: string) => {
    setSelectedAmount(amount);
    setPixModalVisible(true);
  };

  const handleCopyPix = async () => {
    await Clipboard.setStringAsync(PIX_KEY);
    Alert.alert("Chave Copiada!", "Abra o aplicativo do seu banco e cole a chave para pagar.");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financeiro</Text>
      </View>

      <Text style={styles.subtitle}>Histórico de mensalidades</Text>

      {loading ? (
        <ActivityIndicator color="#FF005E" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          style={{ marginTop: 25 }}
          data={payments}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Feather name="dollar-sign" size={32} color="#555" />
              </View>
              <Text style={styles.emptyText}>Nenhuma cobrança encontrada.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const config = getStatusConfig(item.status);
            const isPendingOrLate = item.status === "pendente" || item.status === "atrasado";

            return (
              <Card style={styles.paymentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.monthInfo}>
                    <Text style={styles.referenceMonth}>{item.reference_month}</Text>
                    <Text style={styles.dueDate}>Vence a {formatDate(item.due_date)}</Text>
                  </View>
                  <Text style={styles.amount}>
                    R$ {Number(item.amount).toFixed(2).replace(".", ",")}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                    <Feather name={config.icon as any} size={14} color={config.color} style={{ marginRight: 6 }} />
                    <Text style={[styles.statusText, { color: config.color }]}>
                      {config.text}
                    </Text>
                  </View>

                  {/* Se estiver pago, mostra a data. Se não, mostra o botão de Pagar! */}
                  {item.status === "pago" && item.payment_date ? (
                    <Text style={styles.paymentDate}>Pago a {formatDate(item.payment_date)}</Text>
                  ) : isPendingOrLate ? (
                    <TouchableOpacity 
                      style={styles.payBtn} 
                      onPress={() => handleOpenPix(Number(item.amount).toFixed(2).replace(".", ","))}
                    >
                      <Feather name="copy" size={14} color="#111" style={{ marginRight: 6 }} />
                      <Text style={styles.payBtnText}>Pagar Agora</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* MODAL DE PAGAMENTO PIX */}
      <Modal visible={pixModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pixIconCircle}>
              <Feather name="dollar-sign" size={32} color="#00E676" />
            </View>
            <Text style={styles.modalTitle}>Pagamento via PIX</Text>
            <Text style={styles.pixAmount}>R$ {selectedAmount}</Text>
            
            <View style={styles.pixBox}>
              <Text style={styles.pixLabel}>Chave PIX ({PIX_NAME})</Text>
              <Text style={styles.pixKey}>{PIX_KEY}</Text>
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopyPix}>
              <Feather name="copy" size={20} color="#111" style={{ marginRight: 8 }} />
              <Text style={styles.copyButtonText}>Copiar Chave PIX</Text>
            </TouchableOpacity>

            <Text style={styles.pixInstruction}>
              Após o pagamento, o seu professor dará baixa no sistema automaticamente.
            </Text>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setPixModalVisible(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 5, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#aaa", fontSize: 15, marginBottom: 10 },

  paymentCard: { padding: 20, marginBottom: 15, borderRadius: 20 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  monthInfo: { flex: 1 },
  referenceMonth: { color: "#fff", fontSize: 18, fontWeight: "700" },
  dueDate: { color: "#888", fontSize: 13, marginTop: 4 },
  amount: { color: "#fff", fontSize: 22, fontWeight: "800" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingTop: 15 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontWeight: "700", fontSize: 13 },
  paymentDate: { color: "#666", fontSize: 12 },
  
  payBtn: { backgroundColor: "#00E676", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  payBtnText: { color: "#111", fontWeight: "800", fontSize: 13 },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIconBox: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", marginBottom: 15 },
  emptyText: { color: "#aaa", fontSize: 18, fontWeight: "600" },

  // Estilos do Modal PIX
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1A1A1A", borderRadius: 28, padding: 30, width: "100%", maxWidth: 380, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  pixIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(0, 230, 118, 0.15)", justifyContent: "center", alignItems: "center", marginBottom: 15 },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 5 },
  pixAmount: { color: "#00E676", fontSize: 32, fontWeight: "900", marginBottom: 25 },
  
  pixBox: { backgroundColor: "rgba(255,255,255,0.05)", width: "100%", padding: 15, borderRadius: 16, alignItems: "center", marginBottom: 20 },
  pixLabel: { color: "#888", fontSize: 13, fontWeight: "600", marginBottom: 5 },
  pixKey: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 1 },

  copyButton: { backgroundColor: "#00E676", flexDirection: "row", width: "100%", paddingVertical: 16, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  copyButtonText: { color: "#111", fontWeight: "800", fontSize: 16 },
  
  pixInstruction: { color: "#aaa", fontSize: 13, textAlign: "center", marginBottom: 25, paddingHorizontal: 10 },
  
  closeBtn: { width: "100%", paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center" },
  closeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});