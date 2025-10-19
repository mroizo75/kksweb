"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface EnrollmentData {
  createdAt: Date;
  _count: number;
}

interface DealData {
  stage: string;
  _count: number;
}

interface CourseData {
  title: string;
  enrollmentCount: number;
}

interface DashboardChartsProps {
  enrollmentsByDay: EnrollmentData[];
  dealsByStage: DealData[];
  topCourses: CourseData[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

const STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead",
  QUALIFIED: "Kvalifisert",
  PROPOSAL: "Tilbud",
  NEGOTIATION: "Forhandling",
  WON: "Vunnet",
  LOST: "Tapt",
};

export function DashboardCharts({
  enrollmentsByDay,
  dealsByStage,
  topCourses,
}: DashboardChartsProps) {
  // Aggreger påmeldinger per dag
  const enrollmentMap = new Map<string, number>();
  enrollmentsByDay.forEach((item) => {
    const date = format(new Date(item.createdAt), "yyyy-MM-dd");
    enrollmentMap.set(date, (enrollmentMap.get(date) || 0) + 1);
  });

  const enrollmentChartData = Array.from(enrollmentMap.entries())
    .map(([date, count]) => ({
      date,
      påmeldinger: count,
      displayDate: format(new Date(date), "dd.MM", { locale: nb }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14); // Siste 14 dager

  // Deal pipeline data
  const dealChartData = dealsByStage
    .filter((d) => d.stage !== "WON" && d.stage !== "LOST")
    .map((d) => ({
      stage: STAGE_LABELS[d.stage] || d.stage,
      antall: d._count,
    }));

  // Top courses data
  const courseChartData = topCourses.map((c) => ({
    kurs: c.title.length > 20 ? c.title.substring(0, 20) + "..." : c.title,
    påmeldinger: c.enrollmentCount,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Påmeldinger siste 14 dager */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Påmeldinger Siste 14 Dager</CardTitle>
          <CardDescription>Trend for nye påmeldinger</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="påmeldinger"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CRM Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>CRM Pipeline</CardTitle>
          <CardDescription>Deals per stage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dealChartData}
                dataKey="antall"
                nameKey="stage"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {dealChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topp 5 Kurs */}
      <Card>
        <CardHeader>
          <CardTitle>Topp 5 Kurs</CardTitle>
          <CardDescription>Mest populære kurs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="kurs" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="påmeldinger" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

