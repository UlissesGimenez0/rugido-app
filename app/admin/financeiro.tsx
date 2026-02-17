import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import {
    criarCobranca,
    gerarMensalidadesEmMassa,
    getAlunosParaCobranca,
    getTodosPagamentos,
    marcarComoPago
} from "@/services/admin-financeiro.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    LayoutAnimation,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";

// Habilita animações suaves no Android para o acordeão
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminFinanceiro() {
  const router = useRouter();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingMass, setGeneratingMass] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "pendente" | "pago">("all");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Estados dos Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: "", amount: "", dueDate: "", referenceMonth: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTodosPagamentos();
      setPayments(data);
    } catch (error) { console.error("Erro ao carregar", error); } 
    finally { setLoading(false); }
  };

  const openNewChargeModal = async () => {
    setModalVisible(true);
    if (alunos.length === 0) {
      const listaAlunos = await getAlunosParaCobranca();
      setAlunos(listaAlunos);
    }
  };

  const handleGerarEmMassa = () => {
    Alert.alert("Automatizar Mensalidades", "Gerar fatura para todos os alunos sem cobrança este mês?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Gerar", style: "default", onPress: async () => {
          try {
            setGeneratingMass(true);
            await gerarMensalidadesEmMassa();
            Alert.alert("Sucesso!", "Mensalidades geradas com sucesso.");
            loadData();
          } catch (error: any) { Alert.alert("Erro", error.message); } 
          finally { setGeneratingMass(false); }
        }
      }
    ]);
  };

  const handleCreateCharge = async () => {
    if (!form.userId || !form.amount || !form.dueDate || !form.referenceMonth) {
      Alert.alert("Atenção", "Preencha todos os campos."); return;
    }
    const [day, month, year] = form.dueDate.split("/");
    const dbFormattedDate = `${year}-${month}-${day}`;
    const parsedAmount = Number(form.amount.replace(",", "."));

    try {
      setCreating(true);
      await criarCobranca(form.userId, parsedAmount, dbFormattedDate, form.referenceMonth);
      setModalVisible(false);
      setForm({ userId: "", amount: "", dueDate: "", referenceMonth: "" });
      loadData();
    } catch (error: any) { Alert.alert("Erro", error.message); } 
    finally { setCreating(false); }
  };

const handleDarBaixa = async (paymentId: string, studentName: string) => {
    try { 
      // 1. Vai direto ao banco de dados sem perguntar "Tem a certeza?"
      await marcarComoPago(paymentId); 
      
      // 2. Avisa que deu certo!
      Alert.alert("Sucesso!", `A mensalidade de ${studentName} foi paga!`);
      
      // 3. Atualiza a lista
      loadData(); 
    } 
    catch (error: any) { 
      Alert.alert("Erro ao receber", error.message); 
    }
  };

  const handleDateChange = (text: string) => {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 2) cleaned = cleaned.replace(/^(\d{2})(\d)/, "$1/$2");
    if (cleaned.length > 5) cleaned = cleaned.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    setForm({ ...form, dueDate: cleaned.substring(0, 10) });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const toggleExpand = (studentId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  // --- CÁLCULO DAS MÉTRICAS GLOBAIS (Não mudam com o filtro) ---
  const totalRecebido = payments.filter(p => p.status === "pago").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPendente = payments.filter(p => p.status !== "pago").reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // --- AGRUPAMENTO COM BASE NO FILTRO ---
  const groupedFilteredData = useMemo(() => {
    // 1. Primeiro filtra as faturas baseadas na aba ativa
    const filtered = payments.filter(p => activeFilter === "all" ? true : p.status === activeFilter);
    
    // 2. Depois agrupa por aluno
    const groups: { [key: string]: { name: string, payments: any[], totalValue: number, hasPending: boolean } } = {};
    
    filtered.forEach(p => {
      const studentId = p.user_id;
      const studentName = p.profiles?.name || "Aluno Desconhecido";
      
      if (!groups[studentId]) {
        groups[studentId] = { name: studentName, payments: [], totalValue: 0, hasPending: false };
      }
      
      groups[studentId].payments.push(p);
      groups[studentId].totalValue += Number(p.amount);
      if (p.status !== 'pago') groups[studentId].hasPending = true;
    });

    // 3. Converte para array
    return Object.entries(groups).map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [payments, activeFilter]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financeiro</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openNewChargeModal}>
          <Feather name="plus" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* DASHBOARD CARDS (Métricas) */}
      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, { backgroundColor: "rgba(0, 230, 118, 0.1)" }]}>
          <Feather name="arrow-up-circle" size={20} color="#00E676" style={{ marginBottom: 8 }} />
          <Text style={styles.metricLabel}>Recebido</Text>
          <Text style={[styles.metricValue, { color: "#00E676" }]}>R$ {totalRecebido.toFixed(2).replace(".", ",")}</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: "rgba(255, 193, 7, 0.1)" }]}>
          <Feather name="clock" size={20} color="#FFC107" style={{ marginBottom: 8 }} />
          <Text style={styles.metricLabel}>A Receber</Text>
          <Text style={[styles.metricValue, { color: "#FFC107" }]}>R$ {totalPendente.toFixed(2).replace(".", ",")}</Text>
        </View>
      </View>

      {/* AÇÕES RÁPIDAS */}
      <TouchableOpacity style={styles.actionBtnRow} onPress={handleGerarEmMassa} disabled={generatingMass}>
        {generatingMass ? <ActivityIndicator color="#00E676" size="small" /> : <Feather name="zap" size={20} color="#00E676" />}
        <Text style={styles.actionBtnRowText}>Gerar Mensalidades Automáticas</Text>
        <Feather name="chevron-right" size={18} color="#555" style={{ marginLeft: "auto" }} />
      </TouchableOpacity>

      {/* FILTROS (Abas) */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.filterChip, activeFilter === "all" && styles.filterChipActive]} onPress={() => setActiveFilter("all")}>
            <Text style={[styles.filterText, activeFilter === "all" && styles.filterTextActive]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, activeFilter === "pendente" && styles.filterChipActive]} onPress={() => setActiveFilter("pendente")}>
            <Text style={[styles.filterText, activeFilter === "pendente" && styles.filterTextActive]}>Pendentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, activeFilter === "pago" && styles.filterChipActive]} onPress={() => setActiveFilter("pago")}>
            <Text style={[styles.filterText, activeFilter === "pago" && styles.filterTextActive]}>Pagas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* LISTA DE COBRANÇAS AGRUPADAS */}
      {loading ? (
        <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={groupedFilteredData}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 10, paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="inbox" size={40} color="#333" />
              <Text style={styles.emptyText}>Nenhuma fatura encontrada nesta aba.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedStudent === item.id;
            return (
              <Card style={styles.studentCard}>
                {/* CABEÇALHO DO ALUNO (Sempre visível) */}
                <TouchableOpacity 
                  style={styles.studentHeader} 
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.paymentCount}>{item.payments.length} fatura(s)</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.totalAmount, { color: item.hasPending ? "#FFC107" : "#00E676" }]}>
                      R$ {item.totalValue.toFixed(2).replace(".", ",")}
                    </Text>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#555" style={{ marginTop: 4 }} />
                  </View>
                </TouchableOpacity>

                {/* HISTÓRICO EXPANDIDO (Mensalidades Individuais) */}
                {isExpanded && (
                  <View style={styles.expandedArea}>
                    {item.payments.map((p) => {
                      const isPago = p.status === 'pago';
                      return (
                        <View key={p.id} style={styles.expandedPaymentRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.expandedMonth}>{p.reference_month}</Text>
                            <Text style={styles.expandedDate}>Vence: {formatDate(p.due_date)}</Text>
                          </View>
                          <Text style={styles.expandedAmount}>R$ {Number(p.amount).toFixed(2).replace(".", ",")}</Text>
                          
                          {isPago ? (
                            <View style={styles.badgePago}>
                              <Feather name="check" size={14} color="#00E676" style={{ marginRight: 4 }} />
                              <Text style={styles.badgePagoText}>Pago</Text>
                            </View>
                          ) : (
                            <TouchableOpacity 
                              style={styles.receiveBtn} 
                              onPress={() => handleDarBaixa(p.id, item.name)}
                            >
                              <Text style={styles.receiveBtnText}>Receber</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}

      {/* MODAL NOVA COBRANÇA AVULSA */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Fatura</Text>
            
            <View style={{ minHeight: 60, width: "100%", marginBottom: 15 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {alunos.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.studentChip, form.userId === item.id && styles.studentChipActive]} 
                    onPress={() => setForm({ ...form, userId: item.id })}
                  >
                    <Text style={[styles.studentChipText, form.userId === item.id && { color: "#00E676", fontWeight: "bold" }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput style={styles.input} placeholder="Valor (Ex: 120,00)" placeholderTextColor="#888" keyboardType="decimal-pad" value={form.amount} onChangeText={(t) => setForm({ ...form, amount: t })} />
            <TextInput style={styles.input} placeholder="Mês (Ex: Abril 2026)" placeholderTextColor="#888" value={form.referenceMonth} onChangeText={(t) => setForm({ ...form, referenceMonth: t })} />
            <TextInput style={styles.input} placeholder="Vencimento (DD/MM/AAAA)" placeholderTextColor="#888" keyboardType="numeric" maxLength={10} value={form.dueDate} onChangeText={handleDateChange} />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateCharge} disabled={creating}>
                {creating ? <ActivityIndicator color="#111" /> : <Text style={styles.confirmBtnText}>Gerar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 10 },
  backBtn: { marginRight: 15 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  addButton: { backgroundColor: "#00E676", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  
  // DASHBOARD
  metricsContainer: { flexDirection: "row", gap: 15, marginBottom: 20 },
  metricCard: { flex: 1, padding: 18, borderRadius: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  metricLabel: { color: "#aaa", fontSize: 13, fontWeight: "600", marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },

  // BOTÃO AÇÃO RÁPIDA
  actionBtnRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 16, marginBottom: 20 },
  actionBtnRowText: { color: "#fff", fontSize: 15, fontWeight: "600", marginLeft: 12 },

  // FILTROS
  filterContainer: { height: 45, marginBottom: 15 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  filterChipActive: { backgroundColor: "#00E676" },
  filterText: { color: "#888", fontWeight: "600", fontSize: 14 },
  filterTextActive: { color: "#111", fontWeight: "800" },

  // CARTÕES AGRUPADOS (ACORDEÃO)
  studentCard: { marginBottom: 15, borderRadius: 20, padding: 0, overflow: 'hidden' }, // padding 0 pois o header tem padding
  studentHeader: { flexDirection: "row", alignItems: "center", padding: 18 },
  avatarMini: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  avatarInitial: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  studentName: { color: "#fff", fontSize: 17, fontWeight: "700" },
  paymentCount: { color: "#888", fontSize: 13, marginTop: 2 },
  totalAmount: { fontSize: 16, fontWeight: "800" },

  // ÁREA EXPANDIDA
  expandedArea: { backgroundColor: "rgba(0,0,0,0.15)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingHorizontal: 18, paddingBottom: 10, paddingTop: 5 },
  expandedPaymentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.03)" },
  expandedMonth: { color: "#fff", fontSize: 15, fontWeight: "700" },
  expandedDate: { color: "#888", fontSize: 12, marginTop: 2 },
  expandedAmount: { color: "#fff", fontSize: 15, fontWeight: "700", marginRight: 12 },
  
  badgePago: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  badgePagoText: { color: "#00E676", fontSize: 12, fontWeight: "700" },
  receiveBtn: { backgroundColor: "#00E676", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  receiveBtnText: { color: "#111", fontWeight: "800", fontSize: 12 },

  emptyBox: { alignItems: "center", marginTop: 40, opacity: 0.7 },
  emptyText: { color: "#aaa", marginTop: 15, fontSize: 15 },

  // MODAL AVULSO
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1A1A1A", borderRadius: 28, padding: 24, width: "100%", maxWidth: 360, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  studentChip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, marginRight: 10, justifyContent: "center" },
  studentChipActive: { backgroundColor: "rgba(0, 230, 118, 0.15)", borderWidth: 1, borderColor: "#00E676" },
  studentChipText: { color: "#aaa", fontWeight: "600" },
  input: { width: "100%", backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 16, color: "#fff", marginBottom: 12 },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%", marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  cancelBtnText: { color: "#fff", fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: "center", backgroundColor: "#00E676" },
  confirmBtnText: { color: "#111", fontWeight: "800" },
});