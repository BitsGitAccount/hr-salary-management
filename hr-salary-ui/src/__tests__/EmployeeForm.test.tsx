import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("EmployeeDialog", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Add Employee Mode", () => {
    it("renders form inputs for adding a new employee", async () => {
      render(
        <EmployeeDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={() => {}}
        />
      );

      // Verify form fields are present
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();

      // Verify submit button
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("submits correct API payload when form is filled and submitted", async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "new-emp-1",
          firstName: "John",
          lastName: "Doe",
          jobTitle: "Software Engineer",
          country: "United States",
          salary: 95000,
        }),
      });

      render(
        <EmployeeDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in the form
      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/job title/i), "Software Engineer");
      await user.type(screen.getByLabelText(/country/i), "United States");
      await user.type(screen.getByLabelText(/salary/i), "95000");

      // Submit the form
      await user.click(screen.getByRole("button", { name: /submit/i }));

      // Verify correct API call was made
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/employees"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              firstName: "John",
              lastName: "Doe",
              jobTitle: "Software Engineer",
              country: "United States",
              salary: 95000,
            }),
          })
        );
      });

      // Verify onSuccess callback was called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("displays validation error when required fields are empty", async () => {
      const user = userEvent.setup();

      render(
        <EmployeeDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={() => {}}
        />
      );

      // Try to submit without filling fields
      await user.click(screen.getByRole("button", { name: /submit/i }));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe("Edit Employee Mode", () => {
    const existingEmployee = {
      id: "emp-1",
      firstName: "Jane",
      lastName: "Smith",
      jobTitle: "Product Manager",
      country: "Germany",
      salary: 105000,
      createdAt: "2024-01-15T10:00:00Z",
    };

    it("pre-fills form with existing employee data", async () => {
      render(
        <EmployeeDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={() => {}}
          employee={existingEmployee}
        />
      );

      // Verify form is pre-filled with employee data
      expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("Smith");
      expect(screen.getByLabelText(/job title/i)).toHaveValue("Product Manager");
      expect(screen.getByLabelText(/country/i)).toHaveValue("Germany");
      expect(screen.getByLabelText(/salary/i)).toHaveValue(105000);
    });

    it("sends PUT request when editing existing employee", async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...existingEmployee,
          salary: 115000,
        }),
      });

      render(
        <EmployeeDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
          employee={existingEmployee}
        />
      );

      // Update the salary
      const salaryInput = screen.getByLabelText(/salary/i);
      await user.clear(salaryInput);
      await user.type(salaryInput, "115000");

      // Submit the form
      await user.click(screen.getByRole("button", { name: /submit/i }));

      // Verify PUT request was made with employee ID
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/employees/${existingEmployee.id}`),
          expect.objectContaining({
            method: "PUT",
          })
        );
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Delete Employee", () => {
    it("calls DELETE endpoint when delete is confirmed", async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      const employee = {
        id: "emp-delete-1",
        firstName: "Bob",
        lastName: "Williams",
        jobTitle: "Analyst",
        country: "India",
        salary: 55000,
        createdAt: "2024-01-15T10:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      render(
        <EmployeeDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
          employee={employee}
          mode="delete"
        />
      );

      // Verify delete confirmation message
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Williams/i)).toBeInTheDocument();

      // Click confirm delete button
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      // Verify DELETE request
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/employees/${employee.id}`),
          expect.objectContaining({
            method: "DELETE",
          })
        );
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
