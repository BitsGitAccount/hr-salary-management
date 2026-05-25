"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Employee } from "./EmployeeTable";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employee?: Employee;
  mode?: "add" | "edit" | "delete";
}

interface FormData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  country: string;
  salary: number | "";
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  country?: string;
  salary?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function EmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
  employee,
  mode: explicitMode,
}: EmployeeDialogProps) {
  const mode = explicitMode || (employee ? "edit" : "add");
  const isDeleteMode = mode === "delete";

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    jobTitle: "",
    country: "",
    salary: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (employee && !isDeleteMode) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        jobTitle: employee.jobTitle,
        country: employee.country,
        salary: employee.salary,
      });
    } else if (!employee) {
      setFormData({
        firstName: "",
        lastName: "",
        jobTitle: "",
        country: "",
        salary: "",
      });
    }
    setErrors({});
    setApiError(null);
  }, [employee, open, isDeleteMode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    if (!formData.salary || Number(formData.salary) <= 0) {
      newErrors.salary = "Valid salary is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = employee
        ? `${API_BASE_URL}/api/employees/${employee.id}`
        : `${API_BASE_URL}/api/employees`;

      const response = await fetch(url, {
        method: employee ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          jobTitle: formData.jobTitle,
          country: formData.country,
          salary: Number(formData.salary),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save employee");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setApiError("Failed to save employee. Please try again.");
      console.error("Error saving employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!employee) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employee.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete employee");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setApiError("Failed to delete employee. Please try again.");
      console.error("Error deleting employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (isDeleteMode && employee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {employee.firstName} {employee.lastName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {apiError && (
            <p className="text-sm text-destructive">{apiError}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Update the employee information below."
              : "Fill in the details to add a new employee."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter last name"
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="jobTitle" className="text-sm font-medium">
              Job Title
            </label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              placeholder="Enter job title"
              aria-invalid={!!errors.jobTitle}
            />
            {errors.jobTitle && (
              <p className="text-sm text-destructive">{errors.jobTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Enter country"
              aria-invalid={!!errors.country}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="salary" className="text-sm font-medium">
              Salary
            </label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) =>
                handleInputChange(
                  "salary",
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              placeholder="Enter salary"
              min={0}
              aria-invalid={!!errors.salary}
            />
            {errors.salary && (
              <p className="text-sm text-destructive">{errors.salary}</p>
            )}
          </div>

          {apiError && (
            <p className="text-sm text-destructive">{apiError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
