/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  DollarSign,
  User,
  Check,
  Plus,
  Trash2,
  Edit2,
  Percent,
  Calculator,
  Layers,
  X,
  Sparkles,
  BarChart3,
  Sliders,
  TrendingDown,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Payment, Plan } from "../../../types";
import ConfirmModal from "../../../shared/presentation/components/ConfirmModal";

interface FinanceiroViewProps {
  payments: Payment[];
  onTogglePaymentStatus: (paymentId: string) => void;
  monthlyGoal: number;
  plans: Plan[];
  onUpdatePlans: (plans: Plan[]) => void;
}

export default function FinanceiroView({
  payments,
  onTogglePaymentStatus,
  monthlyGoal,
  plans,
  onUpdatePlans
}: FinanceiroViewProps) {
  
  // Tab state: "fluxo" (cash ledger), "graficos" (MoM charts), "estimativas" (forecasts)
  const [activeSubTab, setActiveSubTab] = useState<"fluxo" | "graficos" | "estimativas">("fluxo");

  // Comparison selectors
  const [compareMonthA, setCompareMonthA] = useState("2026-05");
  const [compareMonthB, setCompareMonthB] = useState("2026-06");

  // Projection simulator parameters
  const [mrrGrowthRate, setMrrGrowthRate] = useState(10); // in % (e.g. 10%)
  const [studentRetentionRate, setStudentRetentionRate] = useState(90); // in % (e.g. 90%)

  // Combine actual payments with rich historical payments for back-to-back monthly comparisons
  const allPayments = useMemo(() => {
    const mockStudents = [
      { name: "Gustavo Silva", planId: "plan-3", joinMonth: 0 }, // Jan (Elite)
      { name: "Ana Souza", planId: "plan-2", joinMonth: 0 }, // Jan (Platinum)
      { name: "Bruno Lima", planId: "plan-1", joinMonth: 1 }, // Feb (Basic)
      { name: "Carla Dias", planId: "plan-2", joinMonth: 1 }, // Feb (Platinum)
      { name: "Daniel Oliveira", planId: "plan-3", joinMonth: 2 }, // Mar (Elite)
      { name: "Fernanda Costa", planId: "plan-1", joinMonth: 2 }, // Mar (Basic)
      { name: "Gabriel Santos", planId: "plan-2", joinMonth: 3 }, // Apr (Platinum)
      { name: "Juliana Ribeiro", planId: "plan-3", joinMonth: 3 }, // Apr (Elite)
      { name: "Lucas Martins", planId: "plan-1", joinMonth: 4 }, // May (Basic)
      { name: "Mariana Souza", planId: "plan-2", joinMonth: 4 }, // May (Platinum)
      { name: "Pedro Rocha", planId: "plan-3", joinMonth: 5 }, // Jun (Elite)
      { name: "Renata Lima", planId: "plan-1", joinMonth: 5 }, // Jun (Basic)
    ];

    const historical: Payment[] = [];
    const monthsInfo = [
      { name: "Janeiro", label: "Jan", index: 1 },
      { name: "Fevereiro", label: "Fev", index: 2 },
      { name: "Março", label: "Mar", index: 3 },
      { name: "Abril", label: "Abr", index: 4 },
      { name: "Maio", label: "Mai", index: 5 },
    ];

    monthsInfo.forEach((m, mIdx) => {
      mockStudents.forEach((student, sIdx) => {
        if (student.joinMonth <= mIdx) {
          const plan = plans.find(p => p.id === student.planId) || { price: 149.90, name: "Basic" };
          // Random but highly stable status: 90%+ paid historically
          const isPaid = (sIdx + mIdx) % 8 !== 0; 
          const day = 10 + (sIdx % 15);
          const dateStr = `2026-0${m.index}-${day < 10 ? '0' + day : day}`;
          historical.push({
            id: `hist-pay-${m.index}-${sIdx}`,
            studentId: `stud-hist-${sIdx}`,
            studentName: student.name,
            amount: plan.price,
            dueDate: dateStr,
            status: isPaid ? "paid" : "overdue",
            paidDate: isPaid ? dateStr : undefined,
            plan: plan.name
          });
        }
      });
    });

    const combined = [...historical];
    payments.forEach(p => {
      if (!combined.some(c => c.id === p.id)) {
        combined.push(p);
      }
    });

    return combined;
  }, [payments, plans]);

  // Group historical & current payments by month
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { monthName: string; monthLabel: string; paid: number; pending: number; overdue: number; total: number }> = {
      "2026-01": { monthName: "Janeiro", monthLabel: "Jan", paid: 0, pending: 0, overdue: 0, total: 0 },
      "2026-02": { monthName: "Fevereiro", monthLabel: "Fev", paid: 0, pending: 0, overdue: 0, total: 0 },
      "2026-03": { monthName: "Março", monthLabel: "Mar", paid: 0, pending: 0, overdue: 0, total: 0 },
      "2026-04": { monthName: "Abril", monthLabel: "Abr", paid: 0, pending: 0, overdue: 0, total: 0 },
      "2026-05": { monthName: "Maio", monthLabel: "Mai", paid: 0, pending: 0, overdue: 0, total: 0 },
      "2026-06": { monthName: "Junho", monthLabel: "Jun", paid: 0, pending: 0, overdue: 0, total: 0 },
      "2026-07": { monthName: "Julho", monthLabel: "Jul", paid: 0, pending: 0, overdue: 0, total: 0 },
    };

    allPayments.forEach(p => {
      const match = p.dueDate.match(/^(\d{4})-(\d{2})/);
      if (match) {
        const key = match[0];
        if (monthsMap[key]) {
          if (p.status === "paid") {
            monthsMap[key].paid += p.amount;
          } else if (p.status === "pending") {
            monthsMap[key].pending += p.amount;
          } else if (p.status === "overdue") {
            monthsMap[key].overdue += p.amount;
          }
          monthsMap[key].total += p.amount;
        }
      }
    });

    return Object.keys(monthsMap).sort().map(key => ({
      key,
      ...monthsMap[key],
      paidFormatted: parseFloat(monthsMap[key].paid.toFixed(2)),
      pendingFormatted: parseFloat(monthsMap[key].pending.toFixed(2)),
      overdueFormatted: parseFloat(monthsMap[key].overdue.toFixed(2)),
      totalFormatted: parseFloat(monthsMap[key].total.toFixed(2)),
    }));
  }, [allPayments]);

  // Month-over-Month automatic analytics (Jun 2026 vs May 2026)
  const MoMStats = useMemo(() => {
    const juneData = monthlyData.find(d => d.key === "2026-06") || { paid: 0, total: 0 };
    const mayData = monthlyData.find(d => d.key === "2026-05") || { paid: 0, total: 0 };

    const revenueDiff = juneData.paid - mayData.paid;
    const revenuePercent = mayData.paid > 0 ? (revenueDiff / mayData.paid) * 100 : 0;

    const totalDiff = juneData.total - mayData.total;
    const totalPercent = mayData.total > 0 ? (totalDiff / mayData.total) * 100 : 0;

    const juneRate = juneData.total > 0 ? (juneData.paid / juneData.total) * 100 : 0;
    const mayRate = mayData.total > 0 ? (mayData.paid / mayData.total) * 100 : 0;
    const rateDiff = juneRate - mayRate;

    return {
      revenueDiff,
      revenuePercent: parseFloat(revenuePercent.toFixed(1)),
      totalDiff,
      totalPercent: parseFloat(totalPercent.toFixed(1)),
      juneRate: parseFloat(juneRate.toFixed(1)),
      mayRate: parseFloat(mayRate.toFixed(1)),
      rateDiff: parseFloat(rateDiff.toFixed(1))
    };
  }, [monthlyData]);

  // Month select comparison logic
  const monthAData = useMemo(() => {
    return monthlyData.find(d => d.key === compareMonthA) || null;
  }, [compareMonthA, monthlyData]);

  const monthBData = useMemo(() => {
    return monthlyData.find(d => d.key === compareMonthB) || null;
  }, [compareMonthB, monthlyData]);

  const customMoMComparison = useMemo(() => {
    if (!monthAData || !monthBData) return null;
    
    const paidDiff = monthBData.paid - monthAData.paid;
    const paidPercent = monthAData.paid > 0 ? (paidDiff / monthAData.paid) * 100 : 0;

    const rateA = monthAData.total > 0 ? (monthAData.paid / monthAData.total) * 100 : 0;
    const rateB = monthBData.total > 0 ? (monthBData.paid / monthBData.total) * 100 : 0;
    const rateDiff = rateB - rateA;

    return {
      paidDiff,
      paidPercent: parseFloat(paidPercent.toFixed(1)),
      rateA: parseFloat(rateA.toFixed(1)),
      rateB: parseFloat(rateB.toFixed(1)),
      rateDiff: parseFloat(rateDiff.toFixed(1))
    };
  }, [monthAData, monthBData]);

  // Dynamic 3-Month Projection Simulator based on current baseline
  const projections = useMemo(() => {
    // We use the June faturamento as baseline
    const juneData = monthlyData.find(d => d.key === "2026-06") || { total: 3200, paid: 2800 };
    const baseline = juneData.total;

    const rateF = mrrGrowthRate / 100;
    const retF = studentRetentionRate / 100;

    const p1 = baseline * retF + (baseline * rateF);
    const p2 = p1 * retF + (p1 * rateF);
    const p3 = p2 * retF + (p2 * rateF);

    return [
      { name: "Linha de Base (Jun)", value: Math.round(baseline) },
      { name: "Agosto (Projetado)", value: Math.round(p1) },
      { name: "Setembro (Projetado)", value: Math.round(p2) },
      { name: "Outubro (Projetado)", value: Math.round(p3) },
    ];
  }, [monthlyData, mrrGrowthRate, studentRetentionRate]);

  // Breakdown of plan revenues
  const planDistribution = useMemo(() => {
    const breakdown: Record<string, number> = {};
    allPayments.forEach(p => {
      if (p.status === "paid") {
        breakdown[p.plan] = (breakdown[p.plan] || 0) + p.amount;
      }
    });
    const colors = ["#00f2ff", "#ccff00", "#10b981", "#ef4444", "#f59e0b"];
    return Object.keys(breakdown).map((key, idx) => ({
      name: key,
      value: parseFloat(breakdown[key].toFixed(2)),
      color: colors[idx % colors.length]
    }));
  }, [allPayments]);

  // Dynamic financial statistics
  const stats = useMemo(() => {
    const paid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
    const overdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
    const totalCount = payments.length;
    const paidCount = payments.filter(p => p.status === "paid").length;
    const rate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
    return { paid, pending, overdue, rate };
  }, [payments]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
      case "overdue":
        return "border-red-500/30 text-red-400 bg-red-500/5";
      default:
        return "border-amber-500/30 text-amber-400 bg-amber-500/5";
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "overdue": return "Em atraso";
      default: return "Pendente";
    }
  };

  // Percent towards monthly coach goal
  const goalPercent = Math.min(Math.round((stats.paid / monthlyGoal) * 100), 100);

  // --- Plan Management States ---
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [planFormMode, setPlanFormMode] = useState<"list" | "add" | "edit" | "bulk">("list");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // State for single plan form
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");

  // Single plan adjustment helper state
  const [singleAdjustmentType, setSingleAdjustmentType] = useState<"fixed" | "percentage">("percentage");
  const [singleAdjustmentInput, setSingleAdjustmentInput] = useState("");

  // State for bulk readjustment form
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState<"percentage" | "fixed">("percentage");
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState("");

  // Helper preview functions
  const getSingleAdjustmentPreview = () => {
    const currentPriceNum = parseFloat(planPrice) || 0;
    const adjustVal = parseFloat(singleAdjustmentInput);
    if (isNaN(adjustVal)) return currentPriceNum;

    if (singleAdjustmentType === "percentage") {
      return Math.max(0, currentPriceNum * (1 + adjustVal / 100));
    } else {
      return Math.max(0, currentPriceNum + adjustVal);
    }
  };

  const getBulkAdjustPreview = (price: number) => {
    const adjustVal = parseFloat(bulkAdjustmentValue);
    if (isNaN(adjustVal)) return price;

    if (bulkAdjustmentType === "percentage") {
      return Math.max(0, price * (1 + adjustVal / 100));
    } else {
      return Math.max(0, price + adjustVal);
    }
  };

  // --- Plan Handlers ---
  const handleOpenAddForm = () => {
    setPlanName("");
    setPlanPrice("");
    setPlanFormMode("add");
  };

  const handleOpenEditForm = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanPrice(plan.price.toString());
    setSingleAdjustmentInput("");
    setSingleAdjustmentType("percentage");
    setPlanFormMode("edit");
  };

  const handleOpenBulkForm = () => {
    setBulkAdjustmentValue("");
    setBulkAdjustmentType("percentage");
    setPlanFormMode("bulk");
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planPrice || isNaN(parseFloat(planPrice))) return;
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: planName,
      price: Math.max(0, parseFloat(planPrice))
    };
    onUpdatePlans([...plans, newPlan]);
    setPlanFormMode("list");
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanId || !planName || !planPrice || isNaN(parseFloat(planPrice))) return;
    onUpdatePlans(plans.map(p => {
      if (p.id === editingPlanId) {
        return {
          ...p,
          name: planName,
          price: Math.max(0, parseFloat(planPrice))
        };
      }
      return p;
    }));
    setPlanFormMode("list");
  };

  // Delete plan states
  const [isConfirmPlanDeleteOpen, setIsConfirmPlanDeleteOpen] = useState(false);
  const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null);
  const [planToDeleteName, setPlanToDeleteName] = useState("");

  const handleDeletePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    const planName = plan ? plan.name : "este plano";
    setPlanToDeleteId(id);
    setPlanToDeleteName(planName);
    setIsConfirmPlanDeleteOpen(true);
  };

  const confirmDeletePlan = () => {
    if (planToDeleteId) {
      onUpdatePlans(plans.filter(p => p.id !== planToDeleteId));
    }
    setIsConfirmPlanDeleteOpen(false);
    setPlanToDeleteId(null);
  };

  const handleApplySingleAdjustment = () => {
    const previewVal = getSingleAdjustmentPreview();
    setPlanPrice(previewVal.toFixed(2));
    setSingleAdjustmentInput("");
  };

  const handleApplyBulkAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const adjustVal = parseFloat(bulkAdjustmentValue);
    if (isNaN(adjustVal)) return;

    const updatedPlans = plans.map(p => {
      let newPrice = p.price;
      if (bulkAdjustmentType === "percentage") {
        newPrice = p.price * (1 + adjustVal / 100);
      } else {
        newPrice = p.price + adjustVal;
      }
      return {
        ...p,
        price: Math.max(0, parseFloat(newPrice.toFixed(2)))
      };
    });

    onUpdatePlans(updatedPlans);
    setBulkAdjustmentValue("");
    setPlanFormMode("list");
  };

  return (
    <div id="financeiro-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#e3e2e4] tracking-tight">Fluxo Financeiro</h2>
          <p className="text-[#b9cacb] text-sm">Controle as mensalidades, acompanhe gráficos de evolução e faça projeções financeiras.</p>
        </div>
        <button
          id="btn-gerenciar-planos"
          onClick={() => {
            setPlanFormMode("list");
            setIsPlansModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-black border border-[#00f2ff]/30 hover:border-transparent px-4 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.05)] hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]"
        >
          <Layers className="w-4 h-4" /> Gerenciar Planos
        </button>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-[#3a494b]/20 gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveSubTab("fluxo")}
          className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "fluxo"
              ? "border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/5"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Fluxo de Caixa
        </button>
        <button
          onClick={() => setActiveSubTab("graficos")}
          className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "graficos"
              ? "border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/5"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Análises & Gráficos
        </button>
        <button
          onClick={() => setActiveSubTab("estimativas")}
          className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "estimativas"
              ? "border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/5"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sliders className="w-4 h-4" /> Projeções & Metas
        </button>
      </div>

      {/* SUB-TAB 1: FLUXO DE CAIXA */}
      {activeSubTab === "fluxo" && (
        <div className="space-y-6">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Paid Card */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-emerald-500 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-bold mb-1">Faturamento Realizado</p>
              <h3 className="font-mono text-3xl font-bold text-emerald-400">{formatCurrency(stats.paid)}</h3>
              
              {/* Goal progress */}
              <div className="mt-4 space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between text-[#b9cacb]">
                  <span>Meta do Mês: {formatCurrency(monthlyGoal)}</span>
                  <span className="font-bold text-[#00dbe7]">{goalPercent}% atingido</span>
                </div>
                <div className="h-1.5 w-full bg-[#343537] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00f2ff]" style={{ width: `${goalPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-amber-500 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <Clock className="w-16 h-16 text-amber-500" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-bold mb-1">A Receber (Pendentes)</p>
              <h3 className="font-mono text-3xl font-bold text-amber-400">{formatCurrency(stats.pending)}</h3>
              <p className="text-[10px] font-mono text-[#b9cacb] mt-3">Mensalidades a vencer nos próximos dias.</p>
            </div>

            {/* Overdue Card */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-red-500 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-bold mb-1">Faturamento em Atraso</p>
              <h3 className="font-mono text-3xl font-bold text-red-400">{formatCurrency(stats.overdue)}</h3>
              <p className="text-[10px] font-mono text-[#b9cacb] mt-3">Alunos com plano vencido pendentes de renovação.</p>
            </div>
          </div>

          {/* Ledgers table */}
          <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#3a494b]/30 bg-[#1f2022]/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#e3e2e4] uppercase font-mono tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00f2ff]" /> Controle de Mensalidades
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#b9cacb] bg-[#343537] px-3 py-1 rounded-full uppercase tracking-wider">
                {stats.rate}% de adimplência
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#292a2c]/60 text-[#b9cacb] border-b border-[#3a494b]/20">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold tracking-wider">ALUNO</th>
                    <th className="px-6 py-3.5 font-semibold tracking-wider">PLANO</th>
                    <th className="px-6 py-3.5 font-semibold tracking-wider">VALOR</th>
                    <th className="px-6 py-3.5 font-semibold tracking-wider">VENCIMENTO</th>
                    <th className="px-6 py-3.5 font-semibold tracking-wider">STATUS</th>
                    <th className="px-6 py-3.5 font-semibold tracking-wider text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a494b]/10 bg-[#121315]/20">
                  {payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#343537] flex items-center justify-center font-bold text-xs text-[#e3e2e4]">
                            {pay.studentName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-[#e3e2e4]">{pay.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#b9cacb]">{pay.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#e3e2e4] font-bold">{formatCurrency(pay.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#b9cacb]">{pay.dueDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] border uppercase font-bold tracking-wide ${statusBadgeClass(pay.status)}`}>
                          {statusText(pay.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onTogglePaymentStatus(pay.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            pay.status === "paid"
                              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-[#00f2ff] hover:text-[#002022]"
                          }`}
                        >
                          {pay.status === "paid" ? "Definir Pendente" : "Marcar como Pago"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-mono">
                        Nenhuma mensalidade cadastrada para este mês.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANÁLISES & GRÁFICOS (Evolution & MoM Comparison) */}
      {activeSubTab === "graficos" && (
        <div className="space-y-6">
          
          {/* Quick MoM Widget and Plan Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick MoM comparison widget */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-gray-850 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-[#e3e2e4] text-xs font-bold uppercase tracking-wide font-mono flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#00f2ff]" /> Comparativo de Desempenho (Junho vs Maio)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Análise de Crescimento</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                {/* Revenue compare card */}
                <div className="bg-[#121315]/50 p-4 rounded-lg border border-gray-900 flex flex-col justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Faturamento Realizado</span>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-white">
                        {MoMStats.revenueDiff >= 0 ? "+" : ""}
                        {formatCurrency(MoMStats.revenueDiff)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      {MoMStats.revenueDiff >= 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{MoMStats.revenuePercent}%
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center">
                          <TrendingDown className="w-3.5 h-3.5" /> {MoMStats.revenuePercent}%
                        </span>
                      )}
                      <span className="text-gray-500">vs mês ant.</span>
                    </div>
                  </div>
                </div>

                {/* Total Billing check card */}
                <div className="bg-[#121315]/50 p-4 rounded-lg border border-gray-900 flex flex-col justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Cobrança Total Emitida</span>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-white">
                        {MoMStats.totalDiff >= 0 ? "+" : ""}
                        {formatCurrency(MoMStats.totalDiff)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      {MoMStats.totalDiff >= 0 ? (
                        <span className="text-[#00f2ff] font-bold flex items-center">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{MoMStats.totalPercent}%
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center">
                          <TrendingDown className="w-3.5 h-3.5" /> {MoMStats.totalPercent}%
                        </span>
                      )}
                      <span className="text-gray-500">vs faturamento total</span>
                    </div>
                  </div>
                </div>

                {/* Compliance rate shift */}
                <div className="bg-[#121315]/50 p-4 rounded-lg border border-gray-900 flex flex-col justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Taxa de Adimplência</span>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-emerald-400">{MoMStats.juneRate}%</span>
                      <span className="text-[10px] text-gray-500 font-normal">esta semana</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      {MoMStats.rateDiff >= 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{MoMStats.rateDiff} pp
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center">
                          <TrendingDown className="w-3.5 h-3.5" /> {MoMStats.rateDiff} pp
                        </span>
                      )}
                      <span className="text-gray-500">vs mês ant. ({MoMStats.mayRate}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan distribution PieChart panel */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 flex flex-col justify-between">
              <div className="border-b border-gray-800 pb-2 mb-3">
                <span className="text-[#e3e2e4] text-xs font-bold uppercase tracking-wide font-mono flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-[#ccff00]" /> Receita por Plano (Faturamento)
                </span>
              </div>
              
              <div className="flex items-center justify-around gap-2 h-[120px]">
                <ResponsiveContainer width="45%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => [formatCurrency(val), "Receita"]}
                      contentStyle={{ backgroundColor: "#161719", borderColor: "#343537", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="w-[50%] font-mono text-[9px] text-gray-300 space-y-1.5">
                  {planDistribution.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1 truncate max-w-[70%]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="font-bold text-white">{formatCurrency(p.value)}</span>
                    </div>
                  ))}
                  {planDistribution.length === 0 && (
                    <span className="text-gray-500 italic block">Sem dados de planos pagos.</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Month-by-month evolution AreaChart */}
          <div className="glass-panel p-5 rounded-xl border border-gray-850 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00f2ff]" /> Evolução Financeira Mês a Mês (Histórico 2026)
              </h3>
              <p className="text-[10px] text-[#b9cacb] font-mono mt-1">
                Visualização de pagamentos realizados (Receita Real), valores pendentes e atrasados.
              </p>
            </div>

            <div className="h-[260px] w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="monthLabel" stroke="#ffffff50" />
                  <YAxis stroke="#ffffff50" tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ backgroundColor: "#161719", borderColor: "#343537", borderRadius: "10px" }}
                    labelStyle={{ fontWeight: "bold", color: "#fff" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name="Pago (Faturamento Real)" type="monotone" dataKey="paidFormatted" stroke="#10b981" fillOpacity={1} fill="url(#colorPaid)" strokeWidth={2.5} />
                  <Area name="A Receber (Pendente)" type="monotone" dataKey="pendingFormatted" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" strokeWidth={1.5} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Side-by-Side Month Comparator Tool */}
          <div className="glass-panel p-5 rounded-xl border border-gray-850 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#ccff00]" /> Comparador Mensal Customizado
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Escolha dois períodos e compare a eficiência de cobrança.</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Mês A:</span>
                  <select
                    value={compareMonthA}
                    onChange={(e) => setCompareMonthA(e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-white rounded px-2 py-1 outline-none"
                  >
                    {monthlyData.map(m => (
                      <option key={m.key} value={m.key}>{m.monthName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Mês B:</span>
                  <select
                    value={compareMonthB}
                    onChange={(e) => setCompareMonthB(e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-white rounded px-2 py-1 outline-none"
                  >
                    {monthlyData.map(m => (
                      <option key={m.key} value={m.key}>{m.monthName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {customMoMComparison ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                {/* Month A specs */}
                <div className="bg-[#121315]/40 border border-gray-900 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Período Referência (Mês A)</span>
                  <h4 className="text-lg font-extrabold text-white">{monthAData?.monthName} 2026</h4>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Pago:</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(monthAData?.paid || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxa Adimplência:</span>
                      <span className="font-bold text-white">{customMoMComparison.rateA}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Emitido:</span>
                      <span className="font-bold text-gray-400">{formatCurrency(monthAData?.total || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Compare Stats metrics */}
                <div className="bg-gradient-to-b from-[#1c1d1f]/30 to-[#121315]/50 border border-gray-900 p-4 rounded-xl flex flex-col justify-center items-center text-center space-y-3.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Variação Realizada (Mês B vs A)</span>
                  
                  <div className="space-y-1">
                    <span className={`text-2xl font-extrabold block ${customMoMComparison.paidDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {customMoMComparison.paidDiff >= 0 ? "+" : ""}
                      {formatCurrency(customMoMComparison.paidDiff)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      customMoMComparison.paidPercent >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {customMoMComparison.paidPercent >= 0 ? "+" : ""}
                      {customMoMComparison.paidPercent}% de receita
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-gray-400 max-w-[180px] leading-relaxed">
                    Variação percentual líquida de pagamentos compensados entre os períodos.
                  </span>
                </div>

                {/* Month B specs */}
                <div className="bg-[#121315]/40 border border-gray-900 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Período Comparado (Mês B)</span>
                  <h4 className="text-lg font-extrabold text-white">{monthBData?.monthName} 2026</h4>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Pago:</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(monthBData?.paid || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxa Adimplência:</span>
                      <span className="font-bold text-white">{customMoMComparison.rateB}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Emitido:</span>
                      <span className="font-bold text-gray-400">{formatCurrency(monthBData?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4 text-xs font-mono">Não foi possível carregar o comparativo.</p>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: ESTIMATIVAS & PROJEÇÕES (Dynamic Simulator & MRR) */}
      {activeSubTab === "estimativas" && (
        <div className="space-y-6">
          
          {/* Key Metric indicators cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
            {/* Projected MRR card */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-[#00f2ff] relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <TrendingUp className="w-16 h-16 text-[#00f2ff]" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Base de Receita Recorrente (MRR)</span>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">
                {formatCurrency(monthlyData.find(d => d.key === "2026-06")?.total || 3490)}
              </h3>
              <p className="text-[10px] text-gray-400 mt-2.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#00f2ff]" /> Valor base mensal gerado por planos ativos.
              </p>
            </div>

            {/* Estimated LTV per student */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-[#ccff00] relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <User className="w-16 h-16 text-[#ccff00]" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">LTV Estimado do Aluno (Lifetime Value)</span>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">
                {formatCurrency(
                  plans.length > 0
                    ? (plans.reduce((sum, p) => sum + p.price, 0) / plans.length) * 6
                    : 149.90 * 6
                )}
              </h3>
              <p className="text-[10px] text-gray-400 mt-2.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#ccff00]" /> Estimado com base em ciclo de renovação de 6 meses.
              </p>
            </div>

            {/* Annual Run Rate */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-emerald-400 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <DollarSign className="w-16 h-16 text-emerald-400" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">ARR Estimado (Annual Run Rate)</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">
                {formatCurrency(
                  (monthlyData.find(d => d.key === "2026-06")?.total || 3490) * 12
                )}
              </h3>
              <p className="text-[10px] text-gray-400 mt-2.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-400" /> Projeção de receita anualizada com base no MRR atual.
              </p>
            </div>
          </div>

          {/* Interactive Projection Simulator with visual Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Sliders Control Panel */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-gray-850 space-y-6 font-mono text-xs">
              <div className="border-b border-gray-800 pb-2 flex items-center justify-between">
                <span className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#00f2ff]" /> Simulador de Escala de Faturamento
                </span>
                <span className="text-[9px] text-[#00f2ff] bg-cyan-950 border border-cyan-800/30 font-bold uppercase px-1.5 py-0.5 rounded">Projeção Dinâmica</span>
              </div>

              {/* Slider 1: Growth Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-300 font-bold">Crescimento de Alunos (Mês):</span>
                  <span className="font-extrabold text-[#00f2ff] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/20 text-xs">+{mrrGrowthRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={mrrGrowthRate}
                  onChange={(e) => setMrrGrowthRate(parseInt(e.target.value))}
                  className="w-full accent-[#00f2ff] bg-gray-950 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Taxa média projetada de novos alunos matriculados mensalmente.
                </p>
              </div>

              {/* Slider 2: Retention Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-300 font-bold">Taxa de Renovação/Retenção:</span>
                  <span className="font-extrabold text-white bg-lime-950 px-2 py-0.5 rounded border border-lime-800/20 text-xs">{studentRetentionRate}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={studentRetentionRate}
                  onChange={(e) => setStudentRetentionRate(parseInt(e.target.value))}
                  className="w-full accent-[#ccff00] bg-gray-950 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Percentual de alunos atuais que renovam os planos a cada ciclo.
                </p>
              </div>

              {/* Business advice text */}
              <div className="bg-[#121315]/50 border border-gray-900 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-[#00f2ff] uppercase tracking-wide block">💡 Insights do Negócio:</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {studentRetentionRate < 80 
                    ? "Sua taxa de renovação está baixa. Foque na retenção e no engajamento dos alunos para aumentar a receita sem depender unicamente de novas vendas."
                    : "Excelente índice de retenção! Com uma base estável, pequenas ações de marketing para captação terão grande impacto multiplicador no faturamento."
                  }
                </p>
              </div>
            </div>

            {/* Simulated Projection Chart */}
            <div className="lg:col-span-3 glass-panel p-5 rounded-xl border border-gray-850 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#ccff00]" /> Estimativa de Faturamento nos Próximos 3 Meses
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Simulação do crescimento do faturamento bruto ajustada aos parâmetros de escala.
                </p>
              </div>

              <div className="h-[210px] w-full font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#ffffff50" />
                    <YAxis stroke="#ffffff50" tickFormatter={(val) => `R$${val}`} />
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), "Projeção"]}
                      contentStyle={{ backgroundColor: "#161719", borderColor: "#343537", borderRadius: "10px" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="value" fill="#00f2ff" radius={[4, 4, 0, 0]}>
                      {projections.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : (index === 3 ? "#ccff00" : "#00f2ff")} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- Plan Management Modal --- */}
      {isPlansModalOpen && (
        <div id="plans-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161719] border border-[#3a494b]/40 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#1f2022]">
              <div className="flex items-center gap-2 text-[#e3e2e4] font-bold font-mono text-sm uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#00f2ff]" />
                {planFormMode === "list" && "Gerenciamento de Planos"}
                {planFormMode === "add" && "Adicionar Novo Plano"}
                {planFormMode === "edit" && "Editar Plano"}
                {planFormMode === "bulk" && "Reajuste Geral em Massa"}
              </div>
              <button 
                onClick={() => setIsPlansModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              
              {/* LIST MODE */}
              {planFormMode === "list" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={handleOpenAddForm}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00f2ff] text-black font-bold font-mono text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl hover:bg-[#00dbe7] transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Novo Plano
                    </button>
                    <button
                      onClick={handleOpenBulkForm}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#343537] text-white border border-[#3a494b]/40 font-bold font-mono text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl hover:bg-[#434547] transition-all cursor-pointer"
                    >
                      <Percent className="w-4 h-4 text-[#00f2ff]" /> Reajuste Geral
                    </button>
                  </div>

                  <div className="divide-y divide-[#3a494b]/20 bg-[#121315]/40 rounded-xl border border-[#3a494b]/30 overflow-hidden">
                    {plans.map(plan => (
                      <div key={plan.id} className="p-4 flex justify-between items-center gap-4 hover:bg-white/[0.01] transition-colors">
                        <div>
                          <p className="font-bold text-[#e3e2e4] text-sm">{plan.name}</p>
                          <p className="font-mono text-xs text-[#00f2ff] font-semibold mt-0.5">
                            {formatCurrency(plan.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditForm(plan)}
                            className="p-2 bg-[#343537]/50 text-gray-300 hover:text-[#00f2ff] rounded-lg transition-colors cursor-pointer"
                            title="Editar Plano"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Plano"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {plans.length === 0 && (
                      <div className="p-6 text-center text-gray-400 font-mono text-xs">
                        Nenhum plano cadastrado.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ADD MODE */}
              {planFormMode === "add" && (
                <form onSubmit={handleAddPlan} className="space-y-4">
                  <div>
                    <label className="block text-[#b9cacb] font-bold font-mono uppercase tracking-wider text-[10px] mb-1.5">
                      Nome do Plano *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Plano Semestral"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      required
                      className="w-full bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-xl outline-none transition-all font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#b9cacb] font-bold font-mono uppercase tracking-wider text-[10px] mb-1.5">
                      Preço do Plano (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 199.90"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      required
                      className="w-full bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-xl outline-none transition-all font-mono text-xs"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPlanFormMode("list")}
                      className="flex-1 bg-transparent hover:bg-white/5 border border-[#3a494b]/40 text-[#b9cacb] font-bold font-mono text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#00f2ff] text-black font-bold font-mono text-xs uppercase tracking-wider py-2.5 rounded-xl hover:bg-[#00dbe7] transition-all cursor-pointer"
                    >
                      Criar Plano
                    </button>
                  </div>
                </form>
              )}

              {/* EDIT MODE */}
              {planFormMode === "edit" && (
                <form onSubmit={handleSavePlan} className="space-y-4">
                  <div>
                    <label className="block text-[#b9cacb] font-bold font-mono uppercase tracking-wider text-[10px] mb-1.5">
                      Nome do Plano *
                    </label>
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      required
                      className="w-full bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-xl outline-none transition-all font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#b9cacb] font-bold font-mono uppercase tracking-wider text-[10px] mb-1.5">
                      Preço Base Atual (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      required
                      className="w-full bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-xl outline-none transition-all font-mono text-xs"
                    />
                  </div>

                  {/* Calculator Box (Assistant for Reajuste) */}
                  <div className="bg-[#121315]/50 border border-[#3a494b]/30 rounded-xl p-4 mt-2 space-y-3">
                    <p className="font-bold font-mono uppercase tracking-wider text-[9px] text-[#00f2ff] flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5" /> Assistente de Reajuste
                    </p>
                    
                    <div className="flex gap-2">
                      <select
                        value={singleAdjustmentType}
                        onChange={(e) => setSingleAdjustmentType(e.target.value as any)}
                        className="bg-[#1c1d1f] border border-[#3a494b]/40 text-white px-2 py-1.5 rounded-lg outline-none font-mono text-xs"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Ex: 10 ou -5"
                        value={singleAdjustmentInput}
                        onChange={(e) => setSingleAdjustmentInput(e.target.value)}
                        className="flex-1 bg-[#1c1d1f] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg outline-none font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono bg-[#1c1d1f]/40 p-2.5 rounded-lg">
                      <span className="text-gray-400">Novo Preço Simulado:</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(getSingleAdjustmentPreview())}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplySingleAdjustment}
                      disabled={!singleAdjustmentInput || isNaN(parseFloat(singleAdjustmentInput))}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold font-mono text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg border border-emerald-500/30 hover:border-transparent transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      Aplicar Reajuste ao Campo
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPlanFormMode("list")}
                      className="flex-1 bg-transparent hover:bg-white/5 border border-[#3a494b]/40 text-[#b9cacb] font-bold font-mono text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#00f2ff] text-black font-bold font-mono text-xs uppercase tracking-wider py-2.5 rounded-xl hover:bg-[#00dbe7] transition-all cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              )}

              {/* BULK READJUST MODE */}
              {planFormMode === "bulk" && (
                <form onSubmit={handleApplyBulkAdjust} className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                    <p className="text-amber-400 font-bold font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Atenção
                    </p>
                    <p className="text-[#b9cacb] text-[10px] leading-relaxed">
                      Este reajuste será aplicado a **todos os {plans.length} planos** cadastrados de uma só vez. Use valores negativos para reduções (ex: -5).
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[#b9cacb] font-bold font-mono uppercase tracking-wider text-[10px] mb-1.5">
                        Tipo de Reajuste
                      </label>
                      <select
                        value={bulkAdjustmentType}
                        onChange={(e) => setBulkAdjustmentType(e.target.value as any)}
                        className="w-full bg-[#121315] border border-[#3a494b]/40 text-white px-3 py-2 rounded-xl outline-none font-mono text-xs"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[#b9cacb] font-bold font-mono uppercase tracking-wider text-[10px] mb-1.5">
                        Fator de Ajuste
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 10 ou -5"
                        value={bulkAdjustmentValue}
                        onChange={(e) => setBulkAdjustmentValue(e.target.value)}
                        required
                        className="w-full bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-xl outline-none transition-all font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Real-time Preview Table */}
                  <div className="space-y-2 mt-2">
                    <p className="font-bold font-mono uppercase tracking-wider text-[10px] text-[#00f2ff]">
                      Simulação do Reajuste Geral:
                    </p>
                    <div className="bg-[#121315]/40 rounded-xl border border-[#3a494b]/30 overflow-hidden font-mono text-[11px]">
                      <div className="grid grid-cols-3 p-2 bg-[#1f2022]/60 font-bold border-b border-[#3a494b]/20 text-[#b9cacb]">
                        <span>PLANO</span>
                        <span className="text-right">ATUAL</span>
                        <span className="text-right text-[#00f2ff]">NOVO</span>
                      </div>
                      <div className="divide-y divide-[#3a494b]/10 max-h-[150px] overflow-y-auto">
                        {plans.map(p => (
                          <div key={p.id} className="grid grid-cols-3 p-2 text-gray-300">
                            <span className="font-bold truncate">{p.name}</span>
                            <span className="text-right text-gray-400">{formatCurrency(p.price)}</span>
                            <span className="text-right text-emerald-400 font-bold">
                              {formatCurrency(getBulkAdjustPreview(p.price))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPlanFormMode("list")}
                      className="flex-1 bg-transparent hover:bg-white/5 border border-[#3a494b]/40 text-[#b9cacb] font-bold font-mono text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!bulkAdjustmentValue || isNaN(parseFloat(bulkAdjustmentValue))}
                      className="flex-1 bg-[#00f2ff] text-black font-bold font-mono text-xs uppercase tracking-wider py-2.5 rounded-xl hover:bg-[#00dbe7] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      Confirmar Reajuste em Massa
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmPlanDeleteOpen}
        title="Excluir Plano"
        message={`Deseja realmente excluir o plano "${planToDeleteName}"? Alunos cadastrados sob este plano precisarão ser reajustados manualmente.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDeletePlan}
        onCancel={() => {
          setIsConfirmPlanDeleteOpen(false);
          setPlanToDeleteId(null);
        }}
        variant="danger"
      />

    </div>
  );
}
