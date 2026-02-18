import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { getPresencasHoje } from "@/services/attendance.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminFrequencia() {
  const router = useRouter();
  const [presencas, setPresencas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAttendance(); }, []);

  async function loadAttendance() {
    try {
      setLoading(true);
      const data = await getPresencasHoje();
      setPresencas(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequência</Text>
      </View>

      {/* MÉTRICAS DE HOJE */}
      <View style={styles.metricsRow}>
        <View style={[styles.miniCard, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
          <Text style={styles.metricNumber}>{presencas.length}</Text>
          <Text style={styles.metricLabel}>Presentes Hoje</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
          <Feather name="users" size={20} color="#888" />
          <Text style={[styles.metricLabel, { marginTop: 5 }]}>Total Alunos</Text>
          <Text style={styles.metricSubValue}>Ativos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Check-ins em tempo real</Text>

      {loading ? (
        <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={presencas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.checkinCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.profiles?.name?.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.studentName}>{item.profiles?.name}</Text>
                <Text style={styles.timeText}>
                   Treino iniciado às {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.activeText}>No Treino</Text>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
  backBtn: { marginRight: 15 },

  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  miniCard: { flex: 1, padding: 20, borderRadius: 20, justifyContent: 'center' },
  metricNumber: { color: '#00E676', fontSize: 32, fontWeight: '900' },
  metricLabel: { color: '#fff', fontSize: 13, fontWeight: '600', opacity: 0.7 },
  metricSubValue: { color: '#888', fontSize: 11, fontWeight: '700', marginTop: 2 },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 15, marginLeft: 5 },
  
  checkinCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  studentName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  timeText: { color: '#666', fontSize: 12, marginTop: 3 },
  
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E676', marginRight: 6 },
  activeText: { color: '#00E676', fontSize: 11, fontWeight: '800' }
});