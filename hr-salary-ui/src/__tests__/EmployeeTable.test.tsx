import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmployeeTable } from "@/components/employees/EmployeeTable";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockEmployeesPage1 = {
  data: [
    {
      id: "emp-1",
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Software Engineer",
      country: "United States",
      salary: 95000,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "emp-2",
      firstName: "Jane",
      lastName: "Smith",
      jobTitle: "Product Manager",
      country: "Germany",
      salary: 105000,
      createdAt: "2024-01-14T10:00:00Z",
    },
    {
      id: "emp-3",
      firstName: "Alice",
      lastName: "Johnson",
      jobTitle: "UX Designer",
      country: "United Kingdom",
      salary: 85000,
      createdAt: "2024-01-13T10:00:00Z",
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    totalCount: 25,
    totalPages: 3,
  },
};

const mockEmployeesPage2 = {
  data: [
    {
      id: "emp-4",
      firstName: "Bob",
      lastName: "Williams",
      jobTitle: "Data Analyst",
      country: "India",
      salary: 55000,
      createdAt: "2024-01-12T10:00:00Z",
    },
  ],
  meta: {
    page: 2,
    limit: 10,
    totalCount: 25,
    totalPages: 3,
  },
};

describe("EmployeeTable", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders employee data rows correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployeesPage1,
    });

    render(<EmployeeTable />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Verify table headers
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Job Title")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();

    // Verify all employee rows are rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("$95,000")).toBeInTheDocument();

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
    expect(screen.getByText("$105,000")).toBeInTheDocument();

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("UX Designer")).toBeInTheDocument();
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    expect(screen.getByText("$85,000")).toBeInTheDocument();
  });

  it("displays pagination controls with Next and Previous buttons", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployeesPage1,
    });

    render(<EmployeeTable />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Verify pagination buttons exist
    const previousButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // On page 1, Previous should be disabled
    expect(previousButton).toBeDisabled();
    // Next should be enabled since there are more pages
    expect(nextButton).toBeEnabled();
  });

  it("navigates to next page when Next button is clicked", async () => {
    const user = userEvent.setup();

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmployeesPage1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmployeesPage2,
      });

    render(<EmployeeTable />);

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click Next button
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    // Wait for page 2 data
    await waitFor(() => {
      expect(screen.getByText("Bob Williams")).toBeInTheDocument();
    });

    // Verify page 2 data is displayed
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
    expect(screen.getByText("India")).toBeInTheDocument();
  });

  it("displays loading state while fetching data", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<EmployeeTable />);

    expect(screen.getByText("Loading employees...")).toBeInTheDocument();
  });

  it("displays page information", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployeesPage1,
    });

    render(<EmployeeTable />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Should show page info like "Page 1 of 3" or similar
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
  });

  it("calls the correct API endpoint with pagination params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployeesPage1,
    });

    render(<EmployeeTable />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/employees\?.*page=1/)
      );
    });
  });
});
