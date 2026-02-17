import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Frequencia() {
  const router = useRouter();
  const today = new Date();
  const user = useAuthStore((state) => state.user);

  const [attendanceDays, setAttendanceDays] = useState<number[]>([]);
  const [totalMonth, setTotalMonth] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streak, setStreak] = useState(0);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const goToPreviousMonth = () => setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNextMonth = () => setSelectedDate(new Date(currentYear, currentMonth + 1, 1));

  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const { data } = await supabase
        .from("attendance")
        .select("date")
        .eq("user_id", user.id)
        .gte("date", startOfMonth.toISOString().split("T")[0])
        .lte("date", endOfMonth.toISOString().split("T")[0]);

      if (data) {
        // Resolve a diferença de fuso horário ao extrair o dia
        const days = data.map((item) => {
          const d = new Date(item.date);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          return d.getDate();
        });
        setAttendanceDays(days);
        setTotalMonth(days.length);
      }

      const { data: allAttendance } = await supabase
        .from("attendance")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (allAttendance) {
        calculateStreak(allAttendance);
      }
    };

    fetchAttendance();
  }, [user, selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const formattedMonth = selectedDate
    .toLocaleString("pt-BR", { month: "long" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const calculateStreak = (data: any[]) => {
    if (!data.length) {
      setStreak(0);
      return;
    }
    const dates = data.map((item) => new Date(item.date));
    let currentStreak = 0;
    let referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(dates[i]);
      // Ajuste de fuso horário
      checkDate.setMinutes(checkDate.getMinutes() + checkDate.getTimezoneOffset());
      checkDate.setHours(0, 0, 0, 0);

      const diff = (referenceDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 0 || diff === 1) {
        currentStreak++;
        referenceDate = checkDate; // Atualiza a referência para o dia anterior
      } else if (diff > 1) {
        break;
      }
    }
    setStreak(currentStreak);
  };

  return (
    <Screen>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequência</Text>
      </View>

      {/* DASHBOARD DE ESTATÍSTICAS (NOVO DESIGN LADO A LADO) */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
            <Feather name="calendar" size={20} color="#007AFF" />
          </View>
          <Text style={styles.statValue}>{totalMonth}</Text>
          <Text style={styles.statLabel}>Treinos no Mês</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: "rgba(255, 0, 94, 0.15)" }]}>
            <Feather name="zap" size={20} color="#FF005E" />
          </View>
          <Text style={styles.statValue}>{streak} <Text style={{ fontSize: 16 }}>🔥</Text></Text>
          <Text style={styles.statLabel}>Sequência Atual</Text>
        </Card>
      </View>

      {/* CALENDÁRIO */}
      <Card style={styles.calendarContainer}>
        
        {/* NAVEGAÇÃO DO MÊS */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {formattedMonth} {currentYear}
          </Text>

          <TouchableOpacity
            onPress={goToNextMonth}
            disabled={isCurrentMonth}
            style={[styles.monthButton, isCurrentMonth && { opacity: 0.2 }]}
          >
            <Feather name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* DIAS DA SEMANA */}
        <View style={styles.weekHeader}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
            <Text key={i} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        {/* GRELHA DOS DIAS */}
        <View style={styles.calendarGrid}>
          {/* Espaços Vazios antes do dia 1 */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCellWrapper} />
          ))}

          {/* Dias do Mês */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const dayNumber = index + 1;
            const isCompleted = attendanceDays.includes(dayNumber);
            const isToday = dayNumber === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isFuture = !isCurrentMonth ? false : dayNumber > today.getDate();

            return (
              <View key={dayNumber} style={styles.dayCellWrapper}>
                <View
                  style={[
                    styles.dayCell,
                    isCompleted && styles.completedDay,
                    isToday && !isCompleted && styles.todayDay,
                    isFuture && { opacity: 0.3 }
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isCompleted && styles.completedDayText,
                      isToday && !isCompleted && styles.todayDayText,
                    ]}
                  >
                    {dayNumber}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },

  // ESTATÍSTICAS NO TOPO
  statsRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
  statCard: { flex: 1, padding: 18, borderRadius: 24, alignItems: "center" },
  statIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  statValue: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 4 },
  statLabel: { color: "#888", fontSize: 13, fontWeight: "600", textAlign: "center" },

  // CALENDÁRIO
  calendarContainer: { padding: 20, borderRadius: 28 },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
  monthTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  monthButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  
  weekHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  weekDay: { width: "14.28%", textAlign: "center", color: "#666", fontWeight: "700", fontSize: 13 },
  
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCellWrapper: { width: "14.28%", aspectRatio: 1, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  
  dayCell: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "transparent" // Fundo padrão
  },
  dayText: { color: "#aaa", fontSize: 15, fontWeight: "500" },

  // ESTADOS DOS DIAS
  completedDay: { backgroundColor: "#00E676", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  completedDayText: { color: "#111", fontWeight: "800" },

  todayDay: { borderWidth: 2, borderColor: "#FF005E" },
  todayDayText: { color: "#FF005E", fontWeight: "800" },
});