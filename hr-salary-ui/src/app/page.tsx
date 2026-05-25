"use client";

import { useState, useCallback } from "react";
import { EmployeeTable, EmployeeDialog, Employee } from "@/components/employees";
import { InsightsDashboard } from "@/components/dashboard/InsightsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, Plus } from "lucide-react";

type View = "employees" | "insights";

export default function Home() {
  const [view, setView] = useState<View>("employees");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "delete">("add");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddEmployee = () => {
    setSelectedEmployee(undefined);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleDialogSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">HR Salary Management</h1>
            </div>
            <nav className="flex gap-2">
              <Button
                variant={view === "employees" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("employees")}
              >
                <Users className="h-4 w-4 mr-1" />
                Employees
              </Button>
              <Button
                variant={view === "insights" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("insights")}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Insights
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {view === "employees" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Directory</CardTitle>
              <Button onClick={handleAddEmployee}>
                <Plus className="h-4 w-4 mr-1" />
                Add Employee
              </Button>
            </CardHeader>
            <CardContent>
              <EmployeeTable
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                refreshTrigger={refreshTrigger}
              />
            </CardContent>
          </Card>
        )}

        {view === "insights" && <InsightsDashboard />}
      </main>

      {/* Employee Dialog */}
      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        employee={selectedEmployee}
        mode={dialogMode}
      />
    </div>
  );
}
