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

  const isCurrentMonth =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const goToPreviousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

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
        const days = data.map((item) => new Date(item.date).getDate());

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
    let yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(dates[i]);
      checkDate.setHours(0, 0, 0, 0);

      const diff =
        (yesterday.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 0 || diff === 1) {
        currentStreak++;
        yesterday = checkDate;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  return (
    <Screen>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Frequência</Text>
      </View>

      <Text style={styles.summary}>
        Você treinou {totalMonth} dias este mês
      </Text>

      <View style={styles.streakContainer}>
        <Text style={styles.streakNumber}>🔥 {streak}</Text>
        <Text style={styles.streakText}>Dias consecutivos</Text>
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.calendarCard}>
          {/* RESUMO */}

          {/* MÊS COM SETAS */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Feather name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {formattedMonth} {currentYear}
            </Text>

            <TouchableOpacity
              onPress={goToNextMonth}
              disabled={isCurrentMonth}
              style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
            >
              <Feather name="chevron-right" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* DIAS DA SEMANA */}
          <View style={styles.weekHeader}>
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* CALENDÁRIO */}
          <View style={styles.calendar}>
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const dayNumber = index + 1;
              const isCompleted = attendanceDays.includes(dayNumber);
              const isToday =
                dayNumber === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <View
                  key={dayNumber}
                  style={[
                    styles.dayCell,
                    isCompleted && styles.completedDay,
                    isToday && styles.todayDay,
                  ]}
                >
                  <Text style={styles.dayText}>{dayNumber}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 15,
  },
  summary: {
    color: "#FF005E",
    fontSize: 18,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  monthTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekDay: {
    width: "14.28%",
    textAlign: "center",
    color: "#aaa",
    fontWeight: "600",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  completedDay: {
    backgroundColor: "#00E676",
    borderRadius: 12,
  },

  todayDay: {
    borderWidth: 2,
    borderColor: "#FF005E",
    borderRadius: 12,
  },

  dayText: {
    color: "#fff",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
  },

  calendarCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,

    elevation: 8, // Android
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  streakNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF005E",
  },

  streakText: {
    color: "#aaa",
    fontSize: 14,
  },
});
