import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import AppAlunoView from "./aluno-mobile/AppAluno.tsx";
import { Student, Workout, Diet, Payment, CoachSettings } from "./types";
import { 
  INITIAL_STUDENTS, 
  INITIAL_WORKOUTS, 
  INITIAL_DIETS, 
  INITIAL_PAYMENTS, 
  INITIAL_COACH_SETTINGS 
} from "./data/seed";
import "./index.css";

function AppAlunoStandalone() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("treinopro_students");
    if (saved) {
      const parsed = (JSON.parse(saved) as Student[]).filter(
        s => s.id !== "stud-seeded-camila" && s.id !== "stud-seeded-ricardo"
      );
      if (parsed.some(s => s.id === "stud-1" || s.id === "stud-2" || s.id === "stud-3")) {
        return INITIAL_STUDENTS;
      }
      if (!parsed.some(s => s.id === "stud-seeded-gustavo")) {
        return [...INITIAL_STUDENTS, ...parsed];
      }
      return parsed;
    }
    return INITIAL_STUDENTS;
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem("treinopro_workouts");
    if (saved) {
      const parsed = JSON.parse(saved) as Workout[];
      return parsed.filter(w => !w.id.includes("seeded"));
    }
    return INITIAL_WORKOUTS;
  });

  const [diets, setDiets] = useState<Diet[]>(() => {
    const saved = localStorage.getItem("treinopro_diets");
    if (saved) {
      const parsed = (JSON.parse(saved) as Diet[]).filter(
        d => d.studentId !== "stud-seeded-camila" && d.studentId !== "stud-seeded-ricardo"
      );
      if (parsed.some(d => d.id === "diet-1" || d.id === "diet-2" || d.studentId === "stud-1")) {
        return INITIAL_DIETS;
      }
      if (!parsed.some(d => d.id === "diet-seeded-gustavo")) {
        return [...INITIAL_DIETS, ...parsed];
      }
      return parsed;
    }
    return INITIAL_DIETS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem("treinopro_payments");
    if (saved) {
      const parsed = (JSON.parse(saved) as Payment[]).filter(
        p => p.studentId !== "stud-seeded-camila" && p.studentId !== "stud-seeded-ricardo"
      );
      if (parsed.some(p => p.id === "pay-1" || p.id === "pay-2" || p.studentId === "stud-1")) {
        return INITIAL_PAYMENTS;
      }
      if (!parsed.some(p => p.id === "pay-seeded-gustavo-1")) {
        return [...INITIAL_PAYMENTS, ...parsed];
      }
      return parsed;
    }
    return INITIAL_PAYMENTS;
  });

  const [coachSettings] = useState<CoachSettings>(() => {
    const saved = localStorage.getItem("treinopro_settings");
    return saved ? JSON.parse(saved) : INITIAL_COACH_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("treinopro_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    // Migration: Ensure the main student is "Gustavo Mangabeira" with email "gustavoworkout85@gmail.com"
    let updated = false;
    const nextStudents = students.map(s => {
      if (s.id === "stud-seeded-gustavo" && (s.name !== "Gustavo Mangabeira" || s.email !== "gustavoworkout85@gmail.com")) {
        updated = true;
        return {
          ...s,
          name: "Gustavo Mangabeira",
          email: "gustavoworkout85@gmail.com",
          initials: "GM"
        };
      }
      return s;
    });
    if (updated) {
      setStudents(nextStudents);
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem("treinopro_workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("treinopro_diets", JSON.stringify(diets));
  }, [diets]);

  useEffect(() => {
    localStorage.setItem("treinopro_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    // Migration: Ensure studentName in payments is "Gustavo Mangabeira"
    let updated = false;
    const nextPayments = payments.map(p => {
      if (p.studentId === "stud-seeded-gustavo" && p.studentName !== "Gustavo Mangabeira") {
        updated = true;
        return {
          ...p,
          studentName: "Gustavo Mangabeira"
        };
      }
      return p;
    });
    if (updated) {
      setPayments(nextPayments);
    }
  }, [payments]);

  return (
    <AppAlunoView 
      students={students}
      workouts={workouts}
      diets={diets}
      payments={payments}
      onBackToTrainer={() => {
        alert("Modo Mobile Dedicado: O acesso ao sistema do professor é feito pelo portal web independente.");
      }}
      onUpdateStudent={(updated) => {
        setStudents(prev => {
          const next = prev.map(s => s.id === updated.id ? updated : s);
          localStorage.setItem("treinopro_students", JSON.stringify(next));
          return next;
        });
      }}
      onSaveWorkout={(updated) => {
        setWorkouts(prev => {
          const next = prev.map(w => w.id === updated.id ? updated : w);
          localStorage.setItem("treinopro_workouts", JSON.stringify(next));
          return next;
        });
      }}
      coachSettings={coachSettings}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppAlunoStandalone />
  </StrictMode>
);
